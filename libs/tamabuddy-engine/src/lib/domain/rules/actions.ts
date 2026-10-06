import {
  AttentionReason,
  IllnessCause,
  TamabuddyState,
} from '../models/TamabuddyState.js';
import { HOUR, STAGE_RULES } from './stageRules.js';

export type TamabuddyCommand =
  | { readonly type: 'feedMeal' }
  | { readonly type: 'feedSnack' }
  | { readonly type: 'play'; readonly result: 'win' | 'loss' }
  | { readonly type: 'clean' }
  | { readonly type: 'giveMedicine' }
  | { readonly type: 'discipline' }
  | { readonly type: 'turnLightsOff' };

export type ActionRejection =
  | 'invalid-behavior'
  | 'sick'
  | 'not-hungry'
  | 'not-unhappy'
  | 'minimum-weight'
  | 'nothing-to-clean'
  | 'not-sick'
  | 'no-discipline-call'
  | 'no-sleep-call'
  | 'requires-cleaning';

export interface DomainActionResult {
  readonly state: TamabuddyState;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
  readonly requestedTransition?: 'SLEEP';
  readonly curedIllness?: boolean;
}

export function applyCareAction(
  state: TamabuddyState,
  command: TamabuddyCommand,
  at: number,
): DomainActionResult {
  if (state.behavior !== 'idle') {
    return reject(state, 'invalid-behavior');
  }

  if (
    state.illness !== null &&
    command.type !== 'clean' &&
    command.type !== 'giveMedicine'
  ) {
    return reject(state, 'sick');
  }

  switch (command.type) {
    case 'feedMeal':
      if (state.hunger >= 4) return reject(state, 'not-hungry');
      return accept({
        ...resolveAttention(state, 'hunger'),
        hunger: state.hunger + 1,
        weight: Math.min(99, state.weight + 1),
        consecutiveSnacks: 0,
        schedules: {
          ...state.schedules,
          nextNeglectDamageAt:
            state.happiness === 0 ? state.schedules.nextNeglectDamageAt : null,
        },
        stageStats: {
          ...state.stageStats,
          meals: state.stageStats.meals + 1,
        },
      });

    case 'feedSnack': {
      if (state.happiness >= 4) return reject(state, 'not-unhappy');
      const consecutiveSnacks = state.consecutiveSnacks + 1;
      let nextState: TamabuddyState = {
        ...resolveAttention(state, 'happiness'),
        happiness: state.happiness + 1,
        weight: Math.min(99, state.weight + 2),
        consecutiveSnacks,
        schedules: {
          ...state.schedules,
          nextNeglectDamageAt:
            state.hunger === 0 ? state.schedules.nextNeglectDamageAt : null,
        },
        stageStats: {
          ...state.stageStats,
          snacks: state.stageStats.snacks + 1,
        },
      };

      if (consecutiveSnacks >= 3) {
        nextState = startIllness(
          { ...nextState, consecutiveSnacks: 0 },
          'diet',
          at,
        );
      } else if (
        nextState.weight >
        STAGE_RULES[nextState.stage].healthyMaxWeight + 5
      ) {
        nextState = startIllness(nextState, 'overweight', at);
      }

      return accept(nextState);
    }

    case 'play':
      if (state.weight <= STAGE_RULES[state.stage].minimumWeight) {
        return reject(state, 'minimum-weight');
      }
      return accept({
        ...(command.result === 'win'
          ? resolveAttention(state, 'happiness')
          : state),
        happiness:
          command.result === 'win'
            ? Math.min(4, state.happiness + 1)
            : state.happiness,
        weight: state.weight - 1,
        schedules: {
          ...state.schedules,
          nextNeglectDamageAt:
            command.result === 'win' && state.hunger > 0
              ? null
              : state.schedules.nextNeglectDamageAt,
        },
        stageStats: {
          ...state.stageStats,
          gamesPlayed: state.stageStats.gamesPlayed + 1,
          gamesWon:
            state.stageStats.gamesWon + (command.result === 'win' ? 1 : 0),
        },
      });

    case 'clean':
      if (state.poopCount === 0) return reject(state, 'nothing-to-clean');
      return accept({
        ...resolveAttention(state, 'poop'),
        poopCount: 0,
      });

    case 'giveMedicine':
      if (state.illness === null) return reject(state, 'not-sick');
      if (state.illness.medicineDoses === 0) {
        return accept({
          ...state,
          illness: { ...state.illness, medicineDoses: 1 },
        });
      }
      if (state.illness.cause === 'hygiene' && state.poopCount >= 3) {
        return reject(state, 'requires-cleaning');
      }
      return {
        ...accept({
          ...resolveAttention(state, 'sickness'),
          health: Math.min(4, state.health + 1),
          illness: null,
        }),
        curedIllness: true,
      };

    case 'discipline':
      if (state.attention?.reason !== 'discipline') {
        return reject(state, 'no-discipline-call');
      }
      return accept({
        ...resolveAttention(state, 'discipline'),
        discipline: Math.min(4, state.discipline + 1),
        schedules: {
          ...state.schedules,
          nextDisciplineAt: state.discipline + 1 >= 4 ? null : at + 6 * HOUR,
        },
      });

    case 'turnLightsOff':
      if (state.attention?.reason !== 'sleep') {
        return reject(state, 'no-sleep-call');
      }
      return {
        ...accept(resolveAttention(state, 'sleep')),
        requestedTransition: 'SLEEP',
      };
  }
}

export function startIllness(
  state: TamabuddyState,
  cause: IllnessCause,
  at: number,
): TamabuddyState {
  if (state.illness !== null) return state;

  return {
    ...state,
    illness: {
      cause,
      startedAt: at,
      medicineDoses: 0,
      nextDamageAt: at + HOUR,
    },
    stageStats: {
      ...state.stageStats,
      sicknessEpisodes: state.stageStats.sicknessEpisodes + 1,
    },
  };
}

function resolveAttention(
  state: TamabuddyState,
  reason: AttentionReason,
): TamabuddyState {
  if (state.attention?.reason !== reason) return state;

  const attentionCooldowns = { ...state.attentionCooldowns };
  delete attentionCooldowns[reason];
  return { ...state, attention: null, attentionCooldowns };
}

function accept(state: TamabuddyState): DomainActionResult {
  return { state, accepted: true };
}

function reject(
  state: TamabuddyState,
  rejection: ActionRejection,
): DomainActionResult {
  return { state, accepted: false, rejection };
}
