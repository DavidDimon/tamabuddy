import { Clock } from '../../application/ports/Clock.js';
import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import {
  AttentionReason,
  cloneTamabuddyState,
  TamabuddyState,
} from '../../domain/models/TamabuddyState.js';
import {
  applyCareAction,
  ActionRejection,
  startIllness,
  TamabuddyCommand,
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
import { transitionTamabuddyBehavior } from '../machine/createTamabuddyActor.js';
import {
  TamabuddyProcessingResult,
  TamabuddyProcessingTraceEntry,
} from './TamabuddyProcessingTrace.js';

export interface TamabuddyCommandResult {
  readonly tamabuddy: Tamabuddy;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
}

export interface TamabuddyCommandTraceEntry {
  readonly at: number;
  readonly command: TamabuddyCommand;
  readonly before: TamabuddyState;
  readonly after: TamabuddyState;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
}

export interface TamabuddyTracedCommandResult extends TamabuddyCommandResult {
  readonly processingTrace: readonly TamabuddyProcessingTraceEntry[];
  readonly commandTrace: TamabuddyCommandTraceEntry;
}

export class TamabuddyProcessor {
  constructor(private readonly clock: Clock) {}

  process(tamabuddy: Tamabuddy): Tamabuddy {
    return this.processWithTrace(tamabuddy).tamabuddy;
  }

  processWithTrace(tamabuddy: Tamabuddy): TamabuddyProcessingResult {
    const target = this.clock.now();
    let state = tamabuddy.snapshot();
    const trace: TamabuddyProcessingTraceEntry[] = [];
    assertEffectiveTime(target, state.lastProcessedAt);

    if (state.behavior === 'dead') return { tamabuddy, trace };

    const attentionState = openHighestPriorityAttention(
      state,
      state.lastProcessedAt,
    );
    appendEffectiveChange(trace, state, attentionState, state.lastProcessedAt);
    state = attentionState;

    while (state.lastProcessedAt < target && state.behavior !== 'dead') {
      const boundary = nextBoundary(state, target);
      const before = state;
      const after = processBoundary(
        { ...state, lastProcessedAt: boundary },
        boundary,
      );
      appendEffectiveChange(trace, before, after, boundary);
      state = after;
    }

    return { tamabuddy: Tamabuddy.restore(state), trace };
  }

  command(
    tamabuddy: Tamabuddy,
    command: TamabuddyCommand,
  ): TamabuddyCommandResult {
    const result = this.commandWithTrace(tamabuddy, command);
    return {
      tamabuddy: result.tamabuddy,
      accepted: result.accepted,
      ...(result.rejection === undefined
        ? {}
        : { rejection: result.rejection }),
    };
  }

  commandWithTrace(
    tamabuddy: Tamabuddy,
    command: TamabuddyCommand,
  ): TamabuddyTracedCommandResult {
    const processing = this.processWithTrace(tamabuddy);
    const before = processing.tamabuddy.snapshot();
    const at = before.lastProcessedAt;
    const action = applyCareAction(before, command, at);
    let state = action.state;

    if (action.requestedTransition === 'SLEEP') {
      state = enterSleep(state, at);
    }
    if (action.curedIllness) state = evolveIfDue(state, at);
    state = openHighestPriorityAttention(state, at);

    const result = Tamabuddy.restore(state);
    const commandTrace: TamabuddyCommandTraceEntry = {
      at,
      command: { ...command },
      before: cloneTamabuddyState(before),
      after: result.snapshot(),
      accepted: action.accepted,
      ...(action.rejection === undefined
        ? {}
        : { rejection: action.rejection }),
    };

    return {
      tamabuddy: result,
      accepted: action.accepted,
      ...(action.rejection === undefined
        ? {}
        : { rejection: action.rejection }),
      processingTrace: processing.trace,
      commandTrace,
    };
  }
}

function appendEffectiveChange(
  trace: TamabuddyProcessingTraceEntry[],
  before: TamabuddyState,
  after: TamabuddyState,
  at: number,
): void {
  if (statesAreEqual(before, after)) return;
  trace.push({
    at,
    before: cloneTamabuddyState(before),
    after: cloneTamabuddyState(after),
  });
}

function statesAreEqual(
  first: TamabuddyState,
  second: TamabuddyState,
): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

function processBoundary(
  initialState: TamabuddyState,
  at: number,
): TamabuddyState {
  let state = initialState;

  if (
    state.stage === 'egg' &&
    at >= state.stageStartedAt + stageDuration('egg')
  ) {
    state = hatchState(
      state,
      at,
      transitionTamabuddyBehavior(state.behavior, { type: 'HATCH' }),
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
      transitionTamabuddyBehavior(state.behavior, { type: 'WAKE' }),
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
      transitionTamabuddyBehavior(state.behavior, { type: 'DIE' }),
    );
  }

  return openHighestPriorityAttention(evolveIfDue(state, at), at);
}

function nextBoundary(state: TamabuddyState, target: number): number {
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

function enterSleep(state: TamabuddyState, at: number): TamabuddyState {
  return enterSleepState(
    state,
    at,
    transitionTamabuddyBehavior(state.behavior, { type: 'SLEEP' }),
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
      'Tamabuddy processing requires a finite integer time at or after lastProcessedAt',
    );
  }
}
