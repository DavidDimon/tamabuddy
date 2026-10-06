import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { DAY, HOUR, MINUTE } from '../../../domain/rules/stageRules.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';
import { TamabuddyBuilder } from '../../../engine/processors/__mocks__/TamabuddyBuilder.mock.js';
import { LifeSimulationRunner } from '../LifeSimulationRunner.js';

describe('LifeSimulationRunner', () => {
  it('returns the untouched initial state for an empty simulation', async () => {
    const initial = TamabuddyBuilder.hatched('baby')
      .with({ hunger: 0 })
      .build();

    const timeline = await new LifeSimulationRunner().run({ initial });

    expect(timeline.finalState).toEqual(initial.snapshot());
    expect(timeline.entries).toEqual([]);
    expect(timeline.duration).toBe(0);
  });

  it('preserves declaration order for commands at equal and later offsets', async () => {
    const initial = TamabuddyBuilder.hatched('baby')
      .with({ hunger: 3, happiness: 3, weight: 6 })
      .build();

    const timeline = await new LifeSimulationRunner().run({
      initial,
      commands: [
        { at: 0, command: { type: 'feedMeal' } },
        { at: 0, command: { type: 'feedSnack' } },
        { at: MINUTE, command: { type: 'play', result: 'win' } },
      ],
    });

    expect(
      timeline.events('command').map((event) => event.command.type),
    ).toEqual(['feedMeal', 'feedSnack', 'play']);
  });

  it('records accepted and rejected command outcomes', async () => {
    const initial = TamabuddyBuilder.hatched('baby')
      .with({ hunger: 3 })
      .build();

    const timeline = await new LifeSimulationRunner().run({
      initial,
      commands: [
        { at: 0, command: { type: 'feedMeal' } },
        { at: 0, command: { type: 'feedMeal' } },
      ],
    });

    expect(timeline.events('command')).toMatchObject([
      { accepted: true },
      { accepted: false, rejection: 'not-hungry' },
    ]);
  });

  it('keeps an intermediate illness visible across one long advance', async () => {
    const initial = TamabuddyBuilder.hatched('child')
      .with({
        poopCount: 2,
        schedules: {
          nextHungerAt: 10 * DAY,
          nextHappinessAt: 10 * DAY,
          nextPoopAt: HOUR,
          nextDisciplineAt: null,
          nextSleepAt: null,
        },
      })
      .build();

    const timeline = await new LifeSimulationRunner().run({
      initial,
      until: 2 * HOUR,
    });

    expect(timeline.events('sick')).toMatchObject([
      { offset: HOUR, cause: 'hygiene' },
    ]);
    expect(timeline.at(30 * MINUTE).illness).toBeNull();
    expect(timeline.at(HOUR).illness?.cause).toBe('hygiene');
  });

  it('returns exact-boundary state and the preceding state between boundaries', async () => {
    const timeline = await new LifeSimulationRunner().run({
      initial: TamabuddyBuilder.hatched('baby').build(),
      until: 40 * MINUTE,
    });

    expect(timeline.at(29 * MINUTE).hunger).toBe(4);
    expect(timeline.at(30 * MINUTE).hunger).toBe(3);
    expect(timeline.at(35 * MINUTE).hunger).toBe(3);
    expect(() => timeline.at(41 * MINUTE)).toThrow(
      'exceeds the simulation duration',
    );
  });

  it('derives hatch and evolution events from processor transitions', async () => {
    const timeline = await new LifeSimulationRunner().run({
      initial: Tamabuddy.create(TamabuddyId.create('pet-1')),
      until: 70 * MINUTE,
    });

    expect(timeline.events('hatched')).toMatchObject([
      { offset: 5 * MINUTE, state: { stage: 'baby' } },
    ]);
    expect(timeline.events('evolved')).toMatchObject([
      { offset: 65 * MINUTE, fromStage: 'baby', toStage: 'child' },
    ]);
  });

  it('derives care-mistake, sleeping, and wake events', async () => {
    const initial = TamabuddyBuilder.hatched('child')
      .with({ schedules: { nextSleepAt: 0 } })
      .build();

    const timeline = await new LifeSimulationRunner().run({
      initial,
      until: 9 * HOUR,
    });

    expect(timeline.events('care-mistake')[0]).toMatchObject({
      offset: 15 * MINUTE,
      reason: 'sleep',
    });
    expect(timeline.events('sleeping')).toMatchObject([
      { offset: 15 * MINUTE },
    ]);
    expect(timeline.events('woke')).toMatchObject([
      { offset: 8 * HOUR + 15 * MINUTE },
    ]);
  });

  it('derives cure and death events', async () => {
    const sick = TamabuddyBuilder.hatched('child')
      .with({
        health: 3,
        illness: {
          cause: 'diet',
          startedAt: 0,
          medicineDoses: 1,
          nextDamageAt: HOUR,
        },
      })
      .build();
    const cured = await new LifeSimulationRunner().run({
      initial: sick,
      commands: [{ at: 0, command: { type: 'giveMedicine' } }],
    });

    expect(cured.events('cured')).toMatchObject([{ offset: 0, cause: 'diet' }]);

    const dying = TamabuddyBuilder.hatched('baby')
      .with({
        health: 1,
        illness: {
          cause: 'diet',
          startedAt: 0,
          medicineDoses: 0,
          nextDamageAt: HOUR,
        },
        schedules: {
          nextHungerAt: 10 * DAY,
          nextHappinessAt: 10 * DAY,
          nextPoopAt: 10 * DAY,
        },
      })
      .build();
    const died = await new LifeSimulationRunner().run({
      initial: dying,
      until: 2 * HOUR,
    });

    expect(died.events('died')).toMatchObject([{ offset: HOUR }]);
  });

  it('rejects backwards plans and commands reached after death', async () => {
    const runner = new LifeSimulationRunner();
    const initial = TamabuddyBuilder.hatched('baby').build();

    await expect(
      runner.run({
        initial,
        commands: [
          { at: 2 * MINUTE, command: { type: 'feedMeal' } },
          { at: MINUTE, command: { type: 'feedMeal' } },
        ],
      }),
    ).rejects.toThrow('cannot move backwards');

    const dying = TamabuddyBuilder.hatched('baby')
      .with({
        health: 1,
        illness: {
          cause: 'diet',
          startedAt: 0,
          medicineDoses: 0,
          nextDamageAt: HOUR,
        },
        schedules: {
          nextHungerAt: 10 * DAY,
          nextHappinessAt: 10 * DAY,
          nextPoopAt: 10 * DAY,
        },
      })
      .build();

    await expect(
      runner.run({
        initial: dying,
        commands: [{ at: 2 * HOUR, command: { type: 'giveMedicine' } }],
      }),
    ).rejects.toThrow('after death');
  });

  it('produces deeply equal timelines for equal inputs', async () => {
    const initial = Tamabuddy.create(TamabuddyId.create('pet-1'));
    const plan = {
      initial,
      commands: [{ at: 35 * MINUTE, command: { type: 'feedMeal' } }] as const,
      until: 2 * HOUR,
    };
    const runner = new LifeSimulationRunner();

    const first = await runner.run(plan);
    const second = await runner.run(plan);

    expect(second.entries).toEqual(first.entries);
    expect(second.finalState).toEqual(first.finalState);
  });
});
