import {
  AttentionCooldowns,
  AttentionReason,
  Behavior,
  emptySchedules,
  emptyStageStats,
  Stage,
  TamabuddySchedules,
  TamabuddyState,
} from '../models/TamabuddyState.js';
import { startIllness } from './actions.js';
import { scoreEvolution } from './evolution.js';
import {
  careStageRules,
  DAY,
  HOUR,
  MINUTE,
  nextStage,
  stageDuration,
  STAGE_RULES,
} from './stageRules.js';

const ATTENTION_DEADLINE = 15 * MINUTE;
const ATTENTION_COOLDOWN = HOUR;
const NEGLECT_DAMAGE_RATE = 2 * HOUR;
export const NATURAL_LIFETIME = 14 * DAY;

export interface AttentionExpiration {
  readonly state: TamabuddyState;
  readonly shouldSleep: boolean;
}

export function hatchState(
  state: TamabuddyState,
  at: number,
  behavior: Behavior,
): TamabuddyState {
  return {
    ...state,
    stage: 'baby',
    behavior,
    hatchedAt: at,
    stageStartedAt: at,
    hunger: 4,
    happiness: 4,
    discipline: 0,
    health: 4,
    weight: 5,
    poopCount: 0,
    schedules: schedulesForStage('baby', at, null),
  };
}

export function wakeState(
  state: TamabuddyState,
  at: number,
  behavior: Behavior,
): TamabuddyState {
  const rules = STAGE_RULES[state.stage];
  return {
    ...state,
    behavior,
    lightsOn: true,
    schedules: {
      ...state.schedules,
      wakeAt: null,
      nextSleepAt:
        rules.awakeDuration === null ? null : at + rules.awakeDuration,
    },
  };
}

export function enterSleepState(
  state: TamabuddyState,
  at: number,
  behavior: Behavior,
): TamabuddyState {
  const sleepDuration = STAGE_RULES[state.stage].sleepDuration;
  if (sleepDuration === null) return state;
  const shift = (timestamp: number | null): number | null =>
    timestamp === null ? null : timestamp + sleepDuration;

  return {
    ...state,
    behavior,
    lightsOn: false,
    attention: null,
    schedules: {
      ...state.schedules,
      nextHungerAt: shift(state.schedules.nextHungerAt),
      nextHappinessAt: shift(state.schedules.nextHappinessAt),
      nextPoopAt: shift(state.schedules.nextPoopAt),
      nextDisciplineAt: shift(state.schedules.nextDisciplineAt),
      nextNeglectDamageAt: shift(state.schedules.nextNeglectDamageAt),
      nextSleepAt: null,
      wakeAt: at + sleepDuration,
    },
  };
}

export function expireAttention(
  state: TamabuddyState,
  at: number,
): AttentionExpiration {
  if (state.attention === null) return { state, shouldSleep: false };
  const reason = state.attention.reason;
  let nextState: TamabuddyState = {
    ...state,
    attention: null,
    careMistakes: state.careMistakes + 1,
    stageStats: {
      ...state.stageStats,
      careMistakes: state.stageStats.careMistakes + 1,
    },
  };

  if (reason === 'sleep') return { state: nextState, shouldSleep: true };

  if (reason === 'discipline') {
    nextState = {
      ...nextState,
      schedules: {
        ...nextState.schedules,
        nextDisciplineAt: at + 6 * HOUR,
      },
    };
  } else {
    nextState = {
      ...nextState,
      attentionCooldowns: {
        ...nextState.attentionCooldowns,
        [reason]: at + ATTENTION_COOLDOWN,
      },
    };
  }

  return { state: nextState, shouldSleep: false };
}

export function applyNeedDecay(
  state: TamabuddyState,
  at: number,
): TamabuddyState {
  if (state.stage === 'egg') return state;
  const rules = careStageRules(state.stage);
  let hunger = state.hunger;
  let happiness = state.happiness;
  let nextHungerAt = state.schedules.nextHungerAt;
  let nextHappinessAt = state.schedules.nextHappinessAt;

  if (nextHungerAt !== null && at >= nextHungerAt) {
    hunger = Math.max(0, hunger - 1);
    nextHungerAt += rules.hungerRate;
  }

  if (nextHappinessAt !== null && at >= nextHappinessAt) {
    happiness = Math.max(0, happiness - 1);
    nextHappinessAt += rules.happinessRate;
  }

  const isNeglected = hunger === 0 || happiness === 0;
  return {
    ...state,
    hunger,
    happiness,
    schedules: {
      ...state.schedules,
      nextHungerAt,
      nextHappinessAt,
      nextNeglectDamageAt: isNeglected
        ? (state.schedules.nextNeglectDamageAt ?? at + NEGLECT_DAMAGE_RATE)
        : null,
    },
  };
}

export function generatePoop(
  state: TamabuddyState,
  at: number,
): TamabuddyState {
  const nextPoopAt = state.schedules.nextPoopAt;
  if (state.stage === 'egg' || nextPoopAt === null || at < nextPoopAt) {
    return state;
  }

  return {
    ...state,
    poopCount: Math.min(3, state.poopCount + 1),
    schedules: {
      ...state.schedules,
      nextPoopAt: nextPoopAt + careStageRules(state.stage).poopRate,
    },
  };
}

export function applyHealthDamage(
  initialState: TamabuddyState,
  at: number,
): TamabuddyState {
  let state = initialState;

  if (state.illness !== null && at >= state.illness.nextDamageAt) {
    state = {
      ...state,
      health: Math.max(0, state.health - 1),
      illness: {
        ...state.illness,
        nextDamageAt: state.illness.nextDamageAt + HOUR,
      },
    };
  }

  if (
    state.behavior === 'idle' &&
    state.schedules.nextNeglectDamageAt !== null &&
    at >= state.schedules.nextNeglectDamageAt
  ) {
    state = {
      ...state,
      health: Math.max(0, state.health - 1),
      schedules: {
        ...state.schedules,
        nextNeglectDamageAt:
          state.hunger === 0 || state.happiness === 0
            ? state.schedules.nextNeglectDamageAt + NEGLECT_DAMAGE_RATE
            : null,
      },
    };
    if (state.health === 1) state = startIllness(state, 'weakness', at);
  }

  return state;
}

export function evolveIfDue(state: TamabuddyState, at: number): TamabuddyState {
  if (!isEvolvableStage(state.stage) || state.illness !== null) return state;
  if (at < state.stageStartedAt + stageDuration(state.stage)) return state;

  const toStage = nextStage(state.stage);
  if (toStage === null || toStage === 'egg') return state;
  const evolution = scoreEvolution(state.stageStats, state.discipline);
  const scheduleBase = scheduleBaseForEvolution(state, at);
  const schedules = schedulesForStage(
    toStage,
    scheduleBase,
    state.behavior === 'sleeping' ? state.schedules.wakeAt : null,
  );

  return {
    ...state,
    stage: toStage,
    stageStartedAt: at,
    weight: Math.max(state.weight, STAGE_RULES[toStage].minimumWeight),
    stageStats: emptyStageStats(),
    evolutionHistory: [
      ...state.evolutionHistory,
      {
        fromStage: state.stage,
        toStage,
        at,
        ...evolution,
      },
    ],
    schedules: {
      ...schedules,
      wakeAt: state.schedules.wakeAt,
      nextSleepAt: state.behavior === 'sleeping' ? null : schedules.nextSleepAt,
      nextNeglectDamageAt:
        state.hunger === 0 || state.happiness === 0
          ? scheduleBase + NEGLECT_DAMAGE_RATE
          : null,
    },
  };
}

export function deadState(
  state: TamabuddyState,
  behavior: Behavior,
): TamabuddyState {
  return {
    ...state,
    behavior,
    attention: null,
    attentionCooldowns: {},
    schedules: emptySchedules(),
  };
}

export function openHighestPriorityAttention(
  state: TamabuddyState,
  at: number,
): TamabuddyState {
  const attentionCooldowns = activeCooldowns(state.attentionCooldowns, at);
  let nextState = { ...state, attentionCooldowns };

  if (nextState.attention !== null) {
    return delayBlockedScheduledCalls(nextState, at);
  }
  if (nextState.behavior !== 'idle') return nextState;

  if (
    nextState.discipline >= 4 &&
    nextState.schedules.nextDisciplineAt !== null
  ) {
    nextState = {
      ...nextState,
      schedules: { ...nextState.schedules, nextDisciplineAt: null },
    };
  }

  const reason = attentionPriority.find(
    (candidate) =>
      isAttentionEligible(nextState, candidate, at) &&
      (nextState.attentionCooldowns[candidate] ?? 0) <= at,
  );
  if (reason === undefined) return nextState;

  const cooldowns = { ...nextState.attentionCooldowns };
  delete cooldowns[reason];
  return delayBlockedScheduledCalls(
    {
      ...nextState,
      attentionCooldowns: cooldowns,
      schedules:
        reason === 'discipline'
          ? { ...nextState.schedules, nextDisciplineAt: null }
          : nextState.schedules,
      attention: {
        reason,
        openedAt: at,
        expiresAt: at + ATTENTION_DEADLINE,
      },
    },
    at,
  );
}

function delayBlockedScheduledCalls(
  state: TamabuddyState,
  at: number,
): TamabuddyState {
  if (state.attention === null) return state;
  const retryAt = state.attention.expiresAt;
  const nextSleepAt = state.schedules.nextSleepAt;
  const nextDisciplineAt = state.schedules.nextDisciplineAt;

  return {
    ...state,
    schedules: {
      ...state.schedules,
      nextSleepAt:
        state.attention.reason !== 'sleep' &&
        nextSleepAt !== null &&
        nextSleepAt <= at
          ? retryAt
          : nextSleepAt,
      nextDisciplineAt:
        state.attention.reason !== 'discipline' &&
        nextDisciplineAt !== null &&
        nextDisciplineAt <= at
          ? retryAt
          : nextDisciplineAt,
    },
  };
}

const attentionPriority: readonly AttentionReason[] = [
  'sickness',
  'poop',
  'hunger',
  'happiness',
  'sleep',
  'discipline',
];

function isAttentionEligible(
  state: TamabuddyState,
  reason: AttentionReason,
  at: number,
): boolean {
  switch (reason) {
    case 'sickness':
      return state.illness !== null;
    case 'poop':
      return state.poopCount >= 2;
    case 'hunger':
      return state.hunger === 0;
    case 'happiness':
      return state.happiness === 0;
    case 'sleep':
      return (
        state.schedules.nextSleepAt !== null &&
        at >= state.schedules.nextSleepAt
      );
    case 'discipline':
      return (
        state.schedules.nextDisciplineAt !== null &&
        at >= state.schedules.nextDisciplineAt &&
        state.discipline < 4
      );
  }
}

function activeCooldowns(
  cooldowns: AttentionCooldowns,
  at: number,
): AttentionCooldowns {
  const active: Partial<Record<AttentionReason, number>> = {};
  for (const reason of attentionPriority) {
    const expiresAt = cooldowns[reason];
    if (expiresAt !== undefined && expiresAt > at) active[reason] = expiresAt;
  }
  return active;
}

function schedulesForStage(
  stage: Exclude<Stage, 'egg'>,
  at: number,
  wakeAt: number | null,
): TamabuddySchedules {
  const rules = careStageRules(stage);
  return {
    nextHungerAt: at + rules.hungerRate,
    nextHappinessAt: at + rules.happinessRate,
    nextPoopAt: at + rules.poopRate,
    nextDisciplineAt:
      rules.disciplineStartsAfter === null
        ? null
        : at + rules.disciplineStartsAfter,
    nextSleepAt:
      wakeAt !== null || rules.awakeDuration === null
        ? null
        : at + rules.awakeDuration,
    wakeAt,
    nextNeglectDamageAt: null,
  };
}

function scheduleBaseForEvolution(state: TamabuddyState, at: number): number {
  if (state.behavior !== 'sleeping') return at;
  if (state.schedules.wakeAt === null) {
    throw new RangeError('Sleeping evolution requires a wake time');
  }
  return state.schedules.wakeAt;
}

export function isEvolvableStage(
  stage: Stage,
): stage is 'baby' | 'child' | 'teen' | 'adult' {
  return stage !== 'egg' && stage !== 'elder';
}
