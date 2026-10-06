import { DAY, HOUR, MINUTE } from '../../../domain/rules/stageRules.js';
import { TamabuddyBuilder } from '../../../engine/processors/__mocks__/TamabuddyBuilder.mock.js';
import { hours, minutes } from '../durations.js';
import { scenario } from '../Scenario.js';
import { ScenarioFailure } from '../ScenarioFailure.js';

describe('Scenario DSL', () => {
  it('expresses the motivating neglected-baby timeline with real engine behavior', async () => {
    const timeline = await scenario('neglected baby')
      .given(TamabuddyBuilder.hatched('baby').build())
      .at(hours(2))
      .feed()
      .wait(hours(6))
      .expect({
        needs: {
          hunger: 'high',
          happiness: 'high',
        },
      })
      .expectEvent('sick', { cause: 'hygiene' })
      .run();

    expect(timeline.finalState.illness?.cause).toBe('hygiene');
    expect(timeline.events('command')).toMatchObject([
      { command: { type: 'feedMeal' }, accepted: true },
    ]);
  });

  it('distinguishes absolute at() from relative wait()', async () => {
    const timeline = await scenario('absolute and relative time')
      .given(
        TamabuddyBuilder.hatched('baby')
          .with({ hunger: 3, happiness: 3, weight: 6 })
          .build(),
      )
      .at(minutes(10))
      .feed()
      .wait(minutes(5))
      .snack()
      .at(minutes(20))
      .play('win')
      .run();

    expect(timeline.events('command').map((event) => event.offset)).toEqual([
      10 * MINUTE,
      15 * MINUTE,
      20 * MINUTE,
    ]);
  });

  it('supports multiple expectations without commands', async () => {
    await scenario('passive observation')
      .given(TamabuddyBuilder.hatched('baby').build())
      .at(minutes(29))
      .expectState({ hunger: 4 })
      .at(minutes(30))
      .expectState({ hunger: 3 })
      .wait(minutes(5))
      .expectState({ hunger: 3 })
      .run();
  });

  it('matches exact fields and semantic need levels', async () => {
    await scenario('state languages')
      .given(TamabuddyBuilder.hatched('baby').build())
      .at(minutes(30))
      .expectState({
        stage: 'baby',
        hunger: 3,
        schedules: { nextHungerAt: 60 * MINUTE },
      })
      .expect({
        needs: {
          hunger: 'medium',
          happiness: 'medium',
        },
      })
      .run();
  });

  it('matches positive and negative events with payloads', async () => {
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

    await scenario('event observations')
      .given(initial)
      .at(minutes(30))
      .expectNoEvent('sick', { cause: 'hygiene' })
      .expectEvent('care-mistake', { reason: 'poop' })
      .at(hours(1))
      .expectEvent('sick', { cause: 'hygiene' })
      .run();
  });

  it('evaluates expectations at their declaration point between equal-time commands', async () => {
    await scenario('same timestamp checkpoints')
      .given(
        TamabuddyBuilder.hatched('baby')
          .with({ hunger: 3, happiness: 3 })
          .build(),
      )
      .feed()
      .expectState({ hunger: 4, happiness: 3 })
      .snack()
      .expectState({ hunger: 4, happiness: 4 })
      .run();
  });

  it('reports missing initial state with scenario and time context', async () => {
    const result = scenario('missing initial').at(minutes(5)).run();

    await expect(result).rejects.toBeInstanceOf(ScenarioFailure);
    await expect(result).rejects.toThrow('Scenario "missing initial" failed');
    await expect(result).rejects.toThrow('Relative offset: 300000');
    await expect(result).rejects.toThrow('Absolute time: unavailable');
    await expect(result).rejects.toThrow('Recent timeline');
  });

  it('rejects temporal regression while building the plan', () => {
    const build = () =>
      scenario('time regression').at(minutes(2)).at(minutes(1));

    expect(build).toThrow(ScenarioFailure);
    expect(build).toThrow('cannot move backwards');
    expect(build).toThrow('Relative offset: 60000');
  });

  it('fails clearly when a required care command is rejected', async () => {
    const result = scenario('rejected care')
      .given(TamabuddyBuilder.hatched('baby').build())
      .feed()
      .run();

    await expect(result).rejects.toThrow('Command feedMeal was rejected');
    await expect(result).rejects.toThrow('"rejection": "not-hungry"');
    await expect(result).rejects.toThrow('Recent timeline');
  });

  it('includes expected, actual, absolute time, and timeline in mismatches', async () => {
    const result = scenario('state mismatch')
      .given(TamabuddyBuilder.hatched('baby', HOUR).build())
      .at(minutes(30))
      .expectState({ hunger: 4 })
      .run();

    await expect(result).rejects.toThrow('Scenario "state mismatch" failed');
    await expect(result).rejects.toThrow('Relative offset: 1800000');
    await expect(result).rejects.toThrow('Absolute time: 5400000');
    await expect(result).rejects.toThrow('Expected:');
    await expect(result).rejects.toThrow('Actual:');
    await expect(result).rejects.toThrow('snapshot at absolute');
  });
});
