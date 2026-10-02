import { Clock } from '../../application/ports/Clock.js';
import { Tamagotchi } from '../../domain/entities/Tamagotchi.js';
import {
  AttentionReason,
  TamagotchiState,
} from '../../domain/models/TamagotchiState.js';
import {
  applyCareAction,
  ActionRejection,
  startIllness,
  TamagotchiCommand,
} from '../../domain/rules/actions.js';
import {
  applyHealthDamage,
  applyNeedDecay,
  deadState,
  enterSleepState,
  evolveIfDue,
  expireAttention,
  generatePoop,
  hatchState,
  isEvolvableStage,
  NATURAL_LIFETIME,
  openHighestPriorityAttention,
  wakeState,
} from '../../domain/rules/elapsedRules.js';
import { stageDuration } from '../../domain/rules/stageRules.js';
import { transitionTamagotchiBehavior } from '../machine/createTamagotchiActor.js';

export interface TamagotchiCommandResult {
  readonly tamagotchi: Tamagotchi;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
}

export class TamagotchiProcessor {
  constructor(private readonly clock: Clock) {}

  process(tamagotchi: Tamagotchi): Tamagotchi {
    const target = this.clock.now();
    let state = tamagotchi.snapshot();
    assertEffectiveTime(target, state.lastProcessedAt);

    if (state.behavior === 'dead') return tamagotchi;
    state = openHighestPriorityAttention(state, state.lastProcessedAt);

    while (state.lastProcessedAt < target && state.behavior !== 'dead') {
      const boundary = nextBoundary(state, target);
      state = processBoundary(
        { ...state, lastProcessedAt: boundary },
        boundary,
      );
    }

    return Tamagotchi.restore(state);
  }

  command(
    tamagotchi: Tamagotchi,
    command: TamagotchiCommand,
  ): TamagotchiCommandResult {
    const processed = this.process(tamagotchi);
    const at = processed.snapshot().lastProcessedAt;
    const action = applyCareAction(processed.snapshot(), command, at);
    let state = action.state;

    if (action.requestedTransition === 'SLEEP') {
      state = enterSleep(state, at);
    }
    if (action.curedIllness) state = evolveIfDue(state, at);
    state = openHighestPriorityAttention(state, at);

    return {
      tamagotchi: Tamagotchi.restore(state),
      accepted: action.accepted,
      ...(action.rejection === undefined
        ? {}
        : { rejection: action.rejection }),
    };
  }
}

function processBoundary(
  initialState: TamagotchiState,
  at: number,
): TamagotchiState {
  let state = initialState;

  if (
    state.stage === 'egg' &&
    at >= state.stageStartedAt + stageDuration('egg')
  ) {
    state = hatchState(
      state,
      at,
      transitionTamagotchiBehavior(state.behavior, { type: 'HATCH' }),
    );
  }

  if (
    state.behavior === 'sleeping' &&
    state.schedules.wakeAt !== null &&
    at >= state.schedules.wakeAt
  ) {
    state = wakeState(
      state,
      at,
      transitionTamagotchiBehavior(state.behavior, { type: 'WAKE' }),
    );
  }

  if (state.attention !== null && at >= state.attention.expiresAt) {
    const expiration = expireAttention(state, at);
    state = expiration.shouldSleep
      ? enterSleep(expiration.state, at)
      : expiration.state;
  }

  if (state.behavior === 'idle') {
    state = applyNeedDecay(state, at);
    state = generatePoop(state, at);
  }

  if (state.poopCount >= 3) state = startIllness(state, 'hygiene', at);
  state = applyHealthDamage(state, at);

  if (
    state.health === 0 ||
    (state.hatchedAt !== null && at >= state.hatchedAt + NATURAL_LIFETIME)
  ) {
    return deadState(
      state,
      transitionTamagotchiBehavior(state.behavior, { type: 'DIE' }),
    );
  }

  return openHighestPriorityAttention(evolveIfDue(state, at), at);
}

function nextBoundary(state: TamagotchiState, target: number): number {
  const candidates = [target];
  const add = (value: number | null | undefined): void => {
    if (
      value !== null &&
      value !== undefined &&
      value > state.lastProcessedAt
    ) {
      candidates.push(value);
    }
  };

  if (state.stage === 'egg') {
    add(state.stageStartedAt + stageDuration('egg'));
  } else if (isEvolvableStage(state.stage) && state.illness === null) {
    add(state.stageStartedAt + stageDuration(state.stage));
  }

  if (state.hatchedAt !== null) add(state.hatchedAt + NATURAL_LIFETIME);
  add(state.attention?.expiresAt);
  add(state.illness?.nextDamageAt);
  add(state.schedules.nextHungerAt);
  add(state.schedules.nextHappinessAt);
  add(state.schedules.nextPoopAt);
  add(state.schedules.nextDisciplineAt);
  add(state.schedules.nextSleepAt);
  add(state.schedules.wakeAt);
  add(state.schedules.nextNeglectDamageAt);

  for (const reason of attentionReasons) add(state.attentionCooldowns[reason]);
  return Math.min(...candidates);
}

function enterSleep(state: TamagotchiState, at: number): TamagotchiState {
  return enterSleepState(
    state,
    at,
    transitionTamagotchiBehavior(state.behavior, { type: 'SLEEP' }),
  );
}

const attentionReasons: readonly AttentionReason[] = [
  'sickness',
  'poop',
  'hunger',
  'happiness',
  'sleep',
  'discipline',
];

function assertEffectiveTime(target: number, lastProcessedAt: number): void {
  if (!Number.isInteger(target) || target < lastProcessedAt) {
    throw new RangeError(
      'Tamagotchi processing requires a finite integer time at or after lastProcessedAt',
    );
  }
}
