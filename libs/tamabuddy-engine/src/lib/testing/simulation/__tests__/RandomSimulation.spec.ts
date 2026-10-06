import { emptySchedules } from '../../../domain/models/TamabuddyState.js';
import { MINUTE } from '../../../domain/rules/stageRules.js';
import { TamabuddyBuilder } from '../../../engine/processors/__mocks__/TamabuddyBuilder.mock.js';
import {
  replayRandomSimulation,
  runRandomSimulation,
} from '../RandomSimulation.js';
import { randomOwner } from '../strategies/randomOwner.js';

describe('seeded random simulation', () => {
  it('produces deeply equal commands, metadata, and timelines for one seed', async () => {
    const plan = {
      initial: hungryChild(),
      seed: 0,
      configuration: {
        responseProbability: 1,
        minimumResponseDelay: 2 * MINUTE,
        maximumResponseDelay: 8 * MINUTE,
      },
      until: 20 * MINUTE,
    } as const;

    const first = await runRandomSimulation(plan);
    const second = await runRandomSimulation(plan);

    expect(second.replay).toEqual(first.replay);
    expect(second.timeline.entries).toEqual(first.timeline.entries);
    expect(first.replay).toMatchObject({
      kind: 'tamabuddy-random-owner-replay',
      prngVersion: 'mulberry32-v1',
      seed: 0,
      configuration: plan.configuration,
      until: plan.until,
    });
    expect(first.replay.commands).toEqual(
      first.timeline.events('command').map((event) => ({
        at: event.offset,
        command: event.command,
      })),
    );
  });

  it('varies command streams for representative seeds', async () => {
    const run = (seed: number) =>
      runRandomSimulation({
        initial: hungryChild(),
        seed,
        configuration: {
          responseProbability: 0.5,
          minimumResponseDelay: 0,
          maximumResponseDelay: 0,
        },
        until: 20 * MINUTE,
      });

    const responsive = await run(0);
    const neglectful = await run(1);

    expect(responsive.replay.commands).toEqual([
      { at: 0, command: { type: 'feedMeal' } },
    ]);
    expect(neglectful.replay.commands).toEqual([]);
    expect(neglectful.timeline.events('care-mistake')).toMatchObject([
      { reason: 'hunger', offset: 15 * MINUTE },
    ]);
  });

  it('reconstructs the original run from replay metadata', async () => {
    const original = await runRandomSimulation({
      initial: hungryChild(),
      seed: 42,
      configuration: {
        responseProbability: 1,
        minimumResponseDelay: MINUTE,
        maximumResponseDelay: 5 * MINUTE,
      },
      until: 20 * MINUTE,
    });

    const replayed = await replayRandomSimulation(original.replay);

    expect(replayed).toEqual(original);
  });

  it('rejects incompatible or altered replay metadata', async () => {
    const original = await runRandomSimulation({
      initial: hungryChild(),
      seed: 7,
      until: 20 * MINUTE,
    });

    await expect(
      replayRandomSimulation({
        ...original.replay,
        prngVersion: 'future-version',
      } as never),
    ).rejects.toThrow('Unsupported replay PRNG version');

    await expect(
      replayRandomSimulation({
        ...original.replay,
        commands: [],
      }),
    ).rejects.toThrow('does not match recorded metadata');
  });

  it('validates probabilities and delay ranges at construction', () => {
    expect(() => randomOwner(0, { responseProbability: -0.1 })).toThrow(
      'responseProbability must be between 0 and 1',
    );
    expect(() => randomOwner(0, { responseProbability: 1.1 })).toThrow(
      'responseProbability must be between 0 and 1',
    );
    expect(() =>
      randomOwner(0, {
        minimumResponseDelay: 2,
        maximumResponseDelay: 1,
      }),
    ).toThrow('maximumResponseDelay cannot precede minimumResponseDelay');
    expect(() => randomOwner(0, { minimumResponseDelay: -1 })).toThrow(
      'minimumResponseDelay must be a non-negative integer duration',
    );
  });

  it('does not act after death or beyond the simulation duration', async () => {
    const dead = TamabuddyBuilder.hatched('child')
      .with({
        behavior: 'dead',
        health: 0,
        attention: null,
        attentionCooldowns: {},
        schedules: emptySchedules(),
      })
      .build();
    const deadRun = await runRandomSimulation({
      initial: dead,
      seed: 0,
      configuration: { responseProbability: 1 },
      until: 20 * MINUTE,
    });
    const delayedRun = await runRandomSimulation({
      initial: hungryChild(),
      seed: 0,
      configuration: {
        responseProbability: 1,
        minimumResponseDelay: 11 * MINUTE,
        maximumResponseDelay: 11 * MINUTE,
      },
      until: 10 * MINUTE,
    });

    expect(deadRun.replay.commands).toEqual([]);
    expect(delayedRun.replay.commands).toEqual([]);
  });
});

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
