import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import {
  cloneTamabuddyState,
  TamabuddyState,
} from '../../domain/models/TamabuddyState.js';
import { ScheduledCommand } from './LifeSimulationRunner.js';
import { LifeTimeline } from './LifeTimeline.js';
import { OwnerSimulationRunner } from './OwnerSimulationRunner.js';
import { SEEDED_RANDOM_VERSION } from './random/Mulberry32RandomSource.js';
import {
  NormalizedRandomOwnerConfiguration,
  randomOwner,
  RandomOwnerConfiguration,
  RandomOwnerStrategy,
} from './strategies/randomOwner.js';

export interface RandomSimulationPlan {
  readonly initial: Tamabuddy | TamabuddyState;
  readonly seed: number;
  readonly configuration?: RandomOwnerConfiguration;
  readonly until: number;
}

export interface RandomOwnerSimulationPlan {
  readonly initial: Tamabuddy | TamabuddyState;
  readonly owner: RandomOwnerStrategy;
  readonly until: number;
}

export interface RandomSimulationReplay {
  readonly kind: 'tamabuddy-random-owner-replay';
  readonly prngVersion: typeof SEEDED_RANDOM_VERSION;
  readonly seed: number;
  readonly configuration: NormalizedRandomOwnerConfiguration;
  readonly initial: TamabuddyState;
  readonly until: number;
  readonly commands: readonly ScheduledCommand[];
}

export interface RandomSimulationResult {
  readonly timeline: LifeTimeline;
  readonly replay: RandomSimulationReplay;
}

export async function runRandomSimulation(
  plan: RandomSimulationPlan,
): Promise<RandomSimulationResult> {
  const owner = randomOwner(plan.seed, plan.configuration);
  return runRandomOwnerSimulation({
    initial: plan.initial,
    owner,
    until: plan.until,
  });
}

export async function runRandomOwnerSimulation(
  plan: RandomOwnerSimulationPlan,
): Promise<RandomSimulationResult> {
  const initial = snapshotOf(plan.initial);
  const { owner } = plan;
  const timeline = await new OwnerSimulationRunner().run({
    initial,
    owner,
    until: plan.until,
  });

  return {
    timeline,
    replay: {
      kind: 'tamabuddy-random-owner-replay',
      prngVersion: owner.prngVersion,
      seed: owner.seed,
      configuration: { ...owner.configuration },
      initial: cloneTamabuddyState(initial),
      until: plan.until,
      commands: commandsFrom(timeline),
    },
  };
}

export async function replayRandomSimulation(
  replay: RandomSimulationReplay,
): Promise<RandomSimulationResult> {
  if (replay.kind !== 'tamabuddy-random-owner-replay') {
    throw new RangeError(`Unsupported replay kind: ${String(replay.kind)}`);
  }
  if (replay.prngVersion !== SEEDED_RANDOM_VERSION) {
    throw new RangeError(
      `Unsupported replay PRNG version: ${String(replay.prngVersion)}`,
    );
  }

  const result = await runRandomSimulation({
    initial: replay.initial,
    seed: replay.seed,
    configuration: replay.configuration,
    until: replay.until,
  });
  if (!commandsEqual(result.replay.commands, replay.commands)) {
    throw new Error('Replay command stream does not match recorded metadata');
  }
  return result;
}

function snapshotOf(initial: Tamabuddy | TamabuddyState): TamabuddyState {
  return cloneTamabuddyState(
    initial instanceof Tamabuddy ? initial.snapshot() : initial,
  );
}

function commandsFrom(timeline: LifeTimeline): readonly ScheduledCommand[] {
  return timeline.events('command').map((event) => ({
    at: event.offset,
    command: { ...event.command },
  }));
}

function commandsEqual(
  first: readonly ScheduledCommand[],
  second: readonly ScheduledCommand[],
): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}
