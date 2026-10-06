import { MINUTE } from '../../../domain/rules/stageRules.js';
import { TamabuddyBuilder } from '../../../engine/processors/__mocks__/TamabuddyBuilder.mock.js';
import { BatchSimulationRunner } from '../BatchSimulationRunner.js';
import { structuralStateInvariant } from '../invariants/SimulationInvariant.js';
import {
  replayRandomSimulation,
  runRandomSimulation,
} from '../RandomSimulation.js';
import { randomOwner } from '../strategies/randomOwner.js';

describe('BatchSimulationRunner', () => {
  it('enumerates explicit seeds and inclusive ranges in deterministic order', async () => {
    const runner = new BatchSimulationRunner();
    const explicit = await runner.run({
      ...basePlan(),
      seeds: [9, 2, 7],
    });
    const range = await runner.run({
      ...basePlan(),
      seeds: { from: 3, to: 5 },
    });

    expect(explicit.completedSeeds).toEqual([9, 2, 7]);
    expect(range.completedSeeds).toEqual([3, 4, 5]);
    expect(explicit).toMatchObject({
      requestedRuns: 3,
      completedRuns: 3,
      passedRuns: 3,
      failedRuns: 0,
      stoppedEarly: false,
      failures: [],
    });
    expect(explicit).not.toHaveProperty('timelines');
  });

  it('supports deterministic stop-early and collect-all failure modes', async () => {
    const oddSeedFails = {
      name: 'even-seeds-only',
      checkFinal: ({ seed }: { readonly seed: number }) =>
        seed % 2 === 0 ? undefined : 'seed must be even',
    };
    const runner = new BatchSimulationRunner();
    const stopped = await runner.run({
      ...basePlan(),
      seeds: [0, 1, 2, 3],
      invariants: [oddSeedFails],
      maximumConcurrency: 1,
      failureMode: 'stop-early',
    });
    const collected = await runner.run({
      ...basePlan(),
      seeds: [0, 1, 2, 3],
      invariants: [oddSeedFails],
      failureMode: 'collect-all',
    });

    expect(stopped.completedSeeds).toEqual([0, 1]);
    expect(stopped.failures.map(({ seed }) => seed)).toEqual([1]);
    expect(stopped.stoppedEarly).toBe(true);
    expect(collected.completedSeeds).toEqual([0, 1, 2, 3]);
    expect(collected.failures.map(({ seed }) => seed)).toEqual([1, 3]);
    expect(collected.stoppedEarly).toBe(false);
  });

  it('calls entry hooks for every timeline entry and final hooks once', async () => {
    const reference = await runRandomSimulation({
      initial: hungryChild(),
      seed: 0,
      configuration: responsiveOwner,
      until: 20 * MINUTE,
    });
    let entryChecks = 0;
    let finalChecks = 0;

    await new BatchSimulationRunner().run({
      ...basePlan(),
      seeds: [0],
      invariants: [
        {
          name: 'hook-counter',
          checkEntry: () => {
            entryChecks += 1;
          },
          checkFinal: () => {
            finalChecks += 1;
          },
        },
      ],
    });

    expect(entryChecks).toBe(reference.timeline.entries.length);
    expect(finalChecks).toBe(1);
  });

  it('returns a replayable failure with bounded diagnostic tails', async () => {
    const summary = await new BatchSimulationRunner().run({
      ...basePlan(),
      seeds: [7],
      commandTailLength: 1,
      eventTailLength: 1,
      invariants: [
        {
          name: 'deliberate-failure',
          checkFinal: () => 'deliberate invariant failure',
        },
      ],
    });
    const failure = summary.failures[0];
    if (failure === undefined) throw new Error('Expected a batch failure');

    expect(failure).toMatchObject({
      seed: 7,
      strategyConfiguration: responsiveOwner,
      invariant: 'deliberate-failure',
      phase: 'final',
      message: 'deliberate invariant failure',
      offset: 20 * MINUTE,
    });
    expect(failure.commandTail).toHaveLength(1);
    expect(failure.eventTail.length).toBeLessThanOrEqual(1);
    expect(failure.snapshot).toEqual(
      (await replayRandomSimulation(failure.replay)).timeline.finalState,
    );
  });

  it('honors concurrency chunks and rejects invalid resource limits', async () => {
    const started: number[] = [];
    const runner = new BatchSimulationRunner();
    const stopped = await runner.run({
      ...basePlan(),
      seeds: [0, 1, 2, 3],
      maximumConcurrency: 2,
      strategyFactory: (seed) => {
        started.push(seed);
        return randomOwner(seed, responsiveOwner);
      },
      invariants: [
        {
          name: 'always-fails',
          checkFinal: () => 'stop this chunk',
        },
      ],
    });

    expect(started).toEqual([0, 1]);
    expect(stopped.completedSeeds).toEqual([0, 1]);
    expect(stopped.failures.map(({ seed }) => seed)).toEqual([0, 1]);

    await expect(
      runner.run({ ...basePlan(), seeds: [0], maximumConcurrency: 0 }),
    ).rejects.toThrow('maximumConcurrency must be an integer from 1 to 64');
    await expect(
      runner.run({
        ...basePlan(),
        seeds: { from: 0, to: 2 },
        maximumRuns: 2,
      }),
    ).rejects.toThrow('Seed selection exceeds maximumRuns 2');
    await expect(runner.run({ ...basePlan(), seeds: [1, 1] })).rejects.toThrow(
      'Seed selection cannot contain duplicates',
    );
  });

  it('ships structural validation through the aggregate boundary', () => {
    const state = hungryChild().snapshot();
    const message = structuralStateInvariant.checkFinal?.({
      seed: 0,
      configuration: responsiveOwner,
      state: { ...state, hunger: 99 },
    });

    expect(message).toBe('hunger must be an integer from 0 to 4');
  });
});

const responsiveOwner = {
  responseProbability: 1,
  minimumResponseDelay: 0,
  maximumResponseDelay: 0,
} as const;

function basePlan() {
  return {
    initial: hungryChild(),
    until: 20 * MINUTE,
    strategyFactory: (seed: number) => randomOwner(seed, responsiveOwner),
    maximumConcurrency: 2,
  } as const;
}

function hungryChild() {
  return TamabuddyBuilder.hatched('child')
    .with({
      hunger: 0,
      attention: {
        reason: 'hunger',
        openedAt: 0,
        expiresAt: 15 * MINUTE,
      },
    })
    .build();
}
