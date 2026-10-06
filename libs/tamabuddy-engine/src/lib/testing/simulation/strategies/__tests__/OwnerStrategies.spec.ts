import { emptySchedules } from '../../../../domain/models/TamabuddyState.js';
import { HOUR, MINUTE } from '../../../../domain/rules/stageRules.js';
import { TamabuddyBuilder } from '../../../../engine/processors/__mocks__/TamabuddyBuilder.mock.js';
import { OwnerSimulationRunner } from '../../OwnerSimulationRunner.js';
import { customOwner } from '../customOwner.js';
import { neglectfulOwner } from '../neglectfulOwner.js';
import { OwnerStrategy } from '../OwnerStrategy.js';
import { perfectOwner } from '../perfectOwner.js';
import { randomOwner } from '../randomOwner.js';

type StrategyFactory = () => OwnerStrategy;

const strategyFactories: readonly [string, StrategyFactory][] = [
  ['perfect owner', () => perfectOwner()],
  ['neglectful owner', () => neglectfulOwner()],
  [
    'custom owner',
    () =>
      customOwner({
        responses: { hunger: { type: 'feedMeal' } },
      }),
  ],
  ['random owner', () => randomOwner(42)],
];

describe.each(strategyFactories)('%s contract', (_name, createStrategy) => {
  it('is deterministic and produces monotonic valid commands', async () => {
    const initial = hungryChild();
    const runner = new OwnerSimulationRunner();

    const first = await runner.run({
      initial,
      owner: createStrategy(),
      until: 20 * MINUTE,
    });
    const second = await runner.run({
      initial,
      owner: createStrategy(),
      until: 20 * MINUTE,
    });
    const commands = first.events('command');
    const offsets = commands.map((event) => event.offset);

    expect(second.entries).toEqual(first.entries);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    expect(commands.every((event) => isKnownCommand(event.command.type))).toBe(
      true,
    );
  });

  it('does not propose commands after death', async () => {
    const dead = TamabuddyBuilder.hatched('child')
      .with({
        behavior: 'dead',
        health: 0,
        attention: null,
        attentionCooldowns: {},
        schedules: emptySchedules(),
      })
      .build();

    const timeline = await new OwnerSimulationRunner().run({
      initial: dead,
      owner: createStrategy(),
      until: HOUR,
    });

    expect(timeline.finalState.behavior).toBe('dead');
    expect(timeline.events('command')).toEqual([]);
  });
});

describe('perfectOwner', () => {
  it('responds to an attention call within its configured delay', async () => {
    const timeline = await new OwnerSimulationRunner().run({
      initial: hungryChild(),
      owner: perfectOwner({ responseDelay: 5 * MINUTE }),
      until: 20 * MINUTE,
    });

    expect(timeline.events('command')).toMatchObject([
      {
        offset: 5 * MINUTE,
        command: { type: 'feedMeal' },
        accepted: true,
      },
    ]);
    expect(timeline.events('care-mistake')).toEqual([]);
  });

  it('adapts hygiene care through cleaning and two medicine doses', async () => {
    const initial = TamabuddyBuilder.hatched('child')
      .with({
        health: 3,
        poopCount: 3,
        illness: {
          cause: 'hygiene',
          startedAt: 0,
          medicineDoses: 0,
          nextDamageAt: HOUR,
        },
        attention: {
          reason: 'sickness',
          openedAt: 0,
          expiresAt: 15 * MINUTE,
        },
      })
      .build();

    const timeline = await new OwnerSimulationRunner().run({
      initial,
      owner: perfectOwner(),
      until: 10 * MINUTE,
    });

    expect(
      timeline.events('command').map((event) => event.command.type),
    ).toEqual(['clean', 'giveMedicine', 'giveMedicine']);
    expect(timeline.events('command').every((event) => event.accepted)).toBe(
      true,
    );
    expect(timeline.finalState.illness).toBeNull();
  });
});

describe('neglectfulOwner', () => {
  it('allows attention calls to expire without proposing commands', async () => {
    const timeline = await new OwnerSimulationRunner().run({
      initial: hungryChild(),
      owner: neglectfulOwner(),
      until: 20 * MINUTE,
    });

    expect(timeline.events('command')).toEqual([]);
    expect(timeline.events('care-mistake')).toMatchObject([
      { reason: 'hunger', offset: 15 * MINUTE },
    ]);
  });
});

describe('customOwner', () => {
  it('rejects unsupported and contradictory configuration', () => {
    expect(() =>
      customOwner({
        responses: {
          unknown: { type: 'feedMeal' },
        } as never,
      }),
    ).toThrow('Unsupported attention reason');

    expect(() =>
      customOwner({
        responses: {
          hunger: { type: 'dance' },
        } as never,
      }),
    ).toThrow('Unsupported owner command');

    expect(() =>
      customOwner({
        responses: { hunger: { type: 'feedMeal' } },
        ignore: ['hunger'],
      }),
    ).toThrow('both respond to and ignore hunger');

    expect(() => customOwner({})).toThrow(
      'requires a response or ignored reason',
    );
  });

  it('keeps engine rejections visible without rewriting proposals', async () => {
    const timeline = await new OwnerSimulationRunner().run({
      initial: hungryChild(),
      owner: customOwner({
        responses: { hunger: { type: 'clean' } },
      }),
      until: 10 * MINUTE,
    });

    expect(timeline.events('command')).toMatchObject([
      {
        command: { type: 'clean' },
        accepted: false,
        rejection: 'nothing-to-clean',
      },
    ]);
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

function isKnownCommand(type: string): type is OwnerCommandType {
  return ownerCommandTypes.includes(type as OwnerCommandType);
}

type OwnerCommandType =
  | 'feedMeal'
  | 'feedSnack'
  | 'play'
  | 'clean'
  | 'giveMedicine'
  | 'discipline'
  | 'turnLightsOff';

const ownerCommandTypes: readonly OwnerCommandType[] = [
  'feedMeal',
  'feedSnack',
  'play',
  'clean',
  'giveMedicine',
  'discipline',
  'turnLightsOff',
];
