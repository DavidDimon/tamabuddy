import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import {
  AttentionReason,
  CareProfile,
  cloneTamabuddyState,
  IllnessCause,
  Stage,
  TamabuddyState,
} from '../../domain/models/TamabuddyState.js';
import {
  ActionRejection,
  TamabuddyCommand,
} from '../../domain/rules/actions.js';
import { assertDuration } from './durations.js';
import {
  SimulationInvariant,
  structuralStateInvariant,
} from './invariants/SimulationInvariant.js';
import {
  CommandOutcome,
  LifeEvent,
  LifeTimeline,
  LifeTimelineEntry,
} from './LifeTimeline.js';
import {
  RandomSimulationReplay,
  runRandomOwnerSimulation,
} from './RandomSimulation.js';
import {
  assertSeed,
  SEEDED_RANDOM_VERSION,
} from './random/Mulberry32RandomSource.js';
import {
  NormalizedRandomOwnerConfiguration,
  RandomOwnerStrategy,
} from './strategies/randomOwner.js';

export interface BatchSeedRange {
  readonly from: number;
  readonly to: number;
}

export type BatchSeedSelection = readonly number[] | BatchSeedRange;
export type BatchFailureMode = 'stop-early' | 'collect-all';
export type BatchStrategyFactory = (seed: number) => RandomOwnerStrategy;

export interface BatchSimulationPlan {
  readonly initial: Tamabuddy | TamabuddyState;
  readonly seeds: BatchSeedSelection;
  readonly until: number;
  readonly strategyFactory: BatchStrategyFactory;
  readonly invariants?: readonly SimulationInvariant[];
  readonly maximumConcurrency: number;
  readonly maximumRuns?: number;
  readonly failureMode?: BatchFailureMode;
  readonly commandTailLength?: number;
  readonly eventTailLength?: number;
}

export interface BatchCommandSummary {
  readonly at: number;
  readonly offset: number;
  readonly command: TamabuddyCommand;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
}

export interface BatchEventSummary {
  readonly type: Exclude<LifeEvent['type'], 'command'>;
  readonly at: number;
  readonly offset: number;
  readonly cause?: IllnessCause;
  readonly reason?: AttentionReason;
  readonly fromStage?: Exclude<Stage, 'elder'>;
  readonly toStage?: Exclude<Stage, 'egg'>;
  readonly score?: number;
  readonly profile?: CareProfile;
}

export interface BatchFailureReport {
  readonly seed: number;
  readonly strategyConfiguration: NormalizedRandomOwnerConfiguration;
  readonly invariant: string;
  readonly phase: 'entry' | 'final';
  readonly message: string;
  readonly at: number;
  readonly offset: number;
  readonly commandTail: readonly BatchCommandSummary[];
  readonly eventTail: readonly BatchEventSummary[];
  readonly snapshot: TamabuddyState;
  readonly replay: RandomSimulationReplay;
}

export interface BatchSimulationSummary {
  readonly requestedRuns: number;
  readonly completedRuns: number;
  readonly passedRuns: number;
  readonly failedRuns: number;
  readonly completedSeeds: readonly number[];
  readonly stoppedEarly: boolean;
  readonly failures: readonly BatchFailureReport[];
}

interface ValidatedBatchPlan {
  readonly initial: Tamabuddy | TamabuddyState;
  readonly seeds: readonly number[];
  readonly until: number;
  readonly strategyFactory: BatchStrategyFactory;
  readonly invariants: readonly SimulationInvariant[];
  readonly maximumConcurrency: number;
  readonly failureMode: BatchFailureMode;
  readonly commandTailLength: number;
  readonly eventTailLength: number;
}

interface SeedOutcome {
  readonly seed: number;
  readonly failure?: BatchFailureReport;
}

const DEFAULT_MAXIMUM_RUNS = 10_000;
const MAXIMUM_ALLOWED_RUNS = 1_000_000;
const MAXIMUM_ALLOWED_CONCURRENCY = 64;
const MAXIMUM_TAIL_LENGTH = 100;

export class BatchSimulationRunner {
  async run(plan: BatchSimulationPlan): Promise<BatchSimulationSummary> {
    const validated = validatePlan(plan);
    const completedSeeds: number[] = [];
    const failures: BatchFailureReport[] = [];

    for (
      let start = 0;
      start < validated.seeds.length;
      start += validated.maximumConcurrency
    ) {
      const chunk = validated.seeds.slice(
        start,
        start + validated.maximumConcurrency,
      );
      const outcomes = await Promise.all(
        chunk.map((seed) => runSeed(seed, validated)),
      );
      completedSeeds.push(...chunk);
      for (const outcome of outcomes) {
        if (outcome.failure !== undefined) failures.push(outcome.failure);
      }
      if (
        validated.failureMode === 'stop-early' &&
        outcomes.some((outcome) => outcome.failure !== undefined)
      ) {
        break;
      }
    }

    return {
      requestedRuns: validated.seeds.length,
      completedRuns: completedSeeds.length,
      passedRuns: completedSeeds.length - failures.length,
      failedRuns: failures.length,
      completedSeeds,
      stoppedEarly: completedSeeds.length < validated.seeds.length,
      failures,
    };
  }
}

async function runSeed(
  seed: number,
  plan: ValidatedBatchPlan,
): Promise<SeedOutcome> {
  const owner = plan.strategyFactory(seed);
  if (owner.seed !== seed) {
    throw new RangeError(
      `Strategy factory returned seed ${owner.seed} for requested seed ${seed}`,
    );
  }
  if (owner.prngVersion !== SEEDED_RANDOM_VERSION) {
    throw new RangeError(
      `Strategy factory returned unsupported PRNG version ${String(owner.prngVersion)}`,
    );
  }

  let result: Awaited<ReturnType<typeof runRandomOwnerSimulation>>;
  try {
    result = await runRandomOwnerSimulation({
      initial: plan.initial,
      owner,
      until: plan.until,
    });
  } catch (error) {
    throw new Error(`Batch simulation failed while executing seed ${seed}`, {
      cause: error,
    });
  }
  const entryFailure = findEntryFailure(
    seed,
    owner.configuration,
    plan.invariants,
    result.timeline,
  );
  const failurePoint =
    entryFailure ??
    findFinalFailure(
      seed,
      owner.configuration,
      plan.invariants,
      result.timeline,
    );

  return {
    seed,
    ...(failurePoint === undefined
      ? {}
      : {
          failure: createFailureReport(
            seed,
            owner.configuration,
            failurePoint,
            result.timeline,
            result.replay,
            plan.commandTailLength,
            plan.eventTailLength,
          ),
        }),
  };
}

interface FailurePoint {
  readonly invariant: string;
  readonly phase: 'entry' | 'final';
  readonly message: string;
  readonly at: number;
  readonly offset: number;
  readonly snapshot: TamabuddyState;
}

function findEntryFailure(
  seed: number,
  configuration: NormalizedRandomOwnerConfiguration,
  invariants: readonly SimulationInvariant[],
  timeline: LifeTimeline,
): FailurePoint | undefined {
  for (const entry of timeline.entries) {
    const state = stateAfter(entry);
    for (const invariant of invariants) {
      if (invariant.checkEntry === undefined) continue;
      const message = checkInvariant(() =>
        invariant.checkEntry?.({ seed, configuration, entry, state }),
      );
      if (message !== undefined) {
        return {
          invariant: invariant.name,
          phase: 'entry',
          message,
          at: entry.at,
          offset: entry.offset,
          snapshot: state,
        };
      }
    }
  }
  return undefined;
}

function findFinalFailure(
  seed: number,
  configuration: NormalizedRandomOwnerConfiguration,
  invariants: readonly SimulationInvariant[],
  timeline: LifeTimeline,
): FailurePoint | undefined {
  const state = timeline.finalState;
  for (const invariant of invariants) {
    if (invariant.checkFinal === undefined) continue;
    const message = checkInvariant(() =>
      invariant.checkFinal?.({ seed, configuration, state }),
    );
    if (message !== undefined) {
      return {
        invariant: invariant.name,
        phase: 'final',
        message,
        at: state.lastProcessedAt,
        offset: state.lastProcessedAt - timeline.origin,
        snapshot: state,
      };
    }
  }
  return undefined;
}

function checkInvariant(check: () => string | void): string | undefined {
  try {
    return check() ?? undefined;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

function stateAfter(entry: LifeTimelineEntry): TamabuddyState {
  if (entry.kind === 'snapshot') return cloneTamabuddyState(entry.after);
  if (entry.type === 'command') return cloneTamabuddyState(entry.after);
  return cloneTamabuddyState(entry.state);
}

function createFailureReport(
  seed: number,
  configuration: NormalizedRandomOwnerConfiguration,
  point: FailurePoint,
  timeline: LifeTimeline,
  replay: RandomSimulationReplay,
  commandTailLength: number,
  eventTailLength: number,
): BatchFailureReport {
  const commands = timeline
    .events('command')
    .filter((event) => event.offset <= point.offset)
    .map(summarizeCommand);
  const events = timeline.entries
    .filter(
      (entry): entry is Exclude<LifeEvent, CommandOutcome> =>
        entry.kind === 'event' &&
        entry.type !== 'command' &&
        entry.offset <= point.offset,
    )
    .map(summarizeEvent);

  return {
    seed,
    strategyConfiguration: { ...configuration },
    invariant: point.invariant,
    phase: point.phase,
    message: point.message,
    at: point.at,
    offset: point.offset,
    commandTail: tail(commands, commandTailLength),
    eventTail: tail(events, eventTailLength),
    snapshot: cloneTamabuddyState(point.snapshot),
    replay,
  };
}

function summarizeCommand(event: CommandOutcome): BatchCommandSummary {
  return {
    at: event.at,
    offset: event.offset,
    command: { ...event.command },
    accepted: event.accepted,
    ...(event.rejection === undefined ? {} : { rejection: event.rejection }),
  };
}

function summarizeEvent(
  event: Exclude<LifeEvent, CommandOutcome>,
): BatchEventSummary {
  const base = { type: event.type, at: event.at, offset: event.offset };
  switch (event.type) {
    case 'sick':
    case 'cured':
      return { ...base, cause: event.cause };
    case 'evolved':
      return {
        ...base,
        fromStage: event.fromStage,
        toStage: event.toStage,
        score: event.score,
        profile: event.profile,
      };
    case 'care-mistake':
      return { ...base, reason: event.reason };
    case 'hatched':
    case 'sleeping':
    case 'woke':
    case 'died':
      return base;
  }
}

function validatePlan(plan: BatchSimulationPlan): ValidatedBatchPlan {
  assertDuration(plan.until, 'batch simulation until');
  assertIntegerRange(
    plan.maximumConcurrency,
    1,
    MAXIMUM_ALLOWED_CONCURRENCY,
    'maximumConcurrency',
  );
  const maximumRuns = plan.maximumRuns ?? DEFAULT_MAXIMUM_RUNS;
  assertIntegerRange(maximumRuns, 1, MAXIMUM_ALLOWED_RUNS, 'maximumRuns');
  const commandTailLength = plan.commandTailLength ?? 10;
  const eventTailLength = plan.eventTailLength ?? 10;
  assertIntegerRange(
    commandTailLength,
    0,
    MAXIMUM_TAIL_LENGTH,
    'commandTailLength',
  );
  assertIntegerRange(
    eventTailLength,
    0,
    MAXIMUM_TAIL_LENGTH,
    'eventTailLength',
  );
  const seeds = enumerateSeeds(plan.seeds, maximumRuns);
  const failureMode = plan.failureMode ?? 'stop-early';
  if (failureMode !== 'stop-early' && failureMode !== 'collect-all') {
    throw new RangeError(
      `Unsupported batch failure mode: ${String(failureMode)}`,
    );
  }
  const invariants = [structuralStateInvariant, ...(plan.invariants ?? [])];
  const names = new Set<string>();
  for (const invariant of invariants) {
    if (invariant.name.length === 0) {
      throw new RangeError('Simulation invariant name cannot be empty');
    }
    if (names.has(invariant.name)) {
      throw new RangeError(`Duplicate simulation invariant: ${invariant.name}`);
    }
    names.add(invariant.name);
  }

  return {
    initial: plan.initial,
    seeds,
    until: plan.until,
    strategyFactory: plan.strategyFactory,
    invariants,
    maximumConcurrency: plan.maximumConcurrency,
    failureMode,
    commandTailLength,
    eventTailLength,
  };
}

function tail<Value>(
  values: readonly Value[],
  length: number,
): readonly Value[] {
  return length === 0 ? [] : values.slice(-length);
}

function enumerateSeeds(
  selection: BatchSeedSelection,
  maximumRuns: number,
): readonly number[] {
  let seeds: readonly number[];
  if ('from' in selection) {
    assertSeed(selection.from);
    assertSeed(selection.to);
    if (selection.to < selection.from) {
      throw new RangeError('Seed range cannot move backwards');
    }
    const count = selection.to - selection.from + 1;
    if (count > maximumRuns) {
      throw new RangeError(`Seed selection exceeds maximumRuns ${maximumRuns}`);
    }
    seeds = Array.from({ length: count }, (_, index) => selection.from + index);
  } else {
    seeds = [...selection];
    if (seeds.length === 0) {
      throw new RangeError('Seed selection cannot be empty');
    }
    if (seeds.length > maximumRuns) {
      throw new RangeError(`Seed selection exceeds maximumRuns ${maximumRuns}`);
    }
    seeds.forEach(assertSeed);
  }
  if (new Set(seeds).size !== seeds.length) {
    throw new RangeError('Seed selection cannot contain duplicates');
  }
  return seeds;
}

function assertIntegerRange(
  value: number,
  minimum: number,
  maximum: number,
  name: string,
): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(
      `${name} must be an integer from ${minimum} to ${maximum}`,
    );
  }
}
