import { Tamagotchi } from '../../../domain/entities/Tamagotchi.js';
import { DAY, HOUR, MINUTE } from '../../../domain/rules/stageRules.js';
import { TamagotchiId } from '../../../domain/value-objects/TamagotchiId.js';
import { FakeClock } from '../../../application/ports/__mocks__/FakeClock.mock.js';
import { TamagotchiBuilder } from '../__mocks__/TamagotchiBuilder.mock.js';
import { TamagotchiProcessor } from '../TamagotchiProcessor.js';

describe('TamagotchiProcessor', () => {
  it('hatches at five minutes and applies stage decay deterministically', () => {
    const clock = new FakeClock(5 * MINUTE - 1);
    const processor = new TamagotchiProcessor(clock);
    const egg = Tamagotchi.create(TamagotchiId.create('pet-1'));

    expect(processor.process(egg).snapshot().stage).toBe('egg');

    clock.set(5 * MINUTE);
    const baby = processor.process(egg);
    expect(baby.snapshot()).toMatchObject({
      stage: 'baby',
      behavior: 'idle',
      hunger: 4,
      happiness: 4,
      weight: 5,
    });

    clock.set(35 * MINUTE);
    expect(processor.process(baby).snapshot()).toMatchObject({
      hunger: 3,
      happiness: 3,
    });
  });

  it('accepts valid meal/play actions and rejects their boundaries', () => {
    const clock = new FakeClock(35 * MINUTE);
    const processor = new TamagotchiProcessor(clock);
    let tamagotchi = Tamagotchi.create(TamagotchiId.create('pet-1'));

    const meal = processor.command(tamagotchi, { type: 'feedMeal' });
    tamagotchi = meal.tamagotchi;
    expect(meal.accepted).toBe(true);
    expect(tamagotchi.snapshot()).toMatchObject({ hunger: 4, weight: 6 });

    expect(processor.command(tamagotchi, { type: 'feedMeal' }).rejection).toBe(
      'not-hungry',
    );

    const play = processor.command(tamagotchi, {
      type: 'play',
      result: 'win',
    });
    expect(play.accepted).toBe(true);
    expect(play.tamagotchi.snapshot()).toMatchObject({
      happiness: 4,
      weight: 5,
    });
    expect(
      processor.command(play.tamagotchi, {
        type: 'play',
        result: 'loss',
      }).rejection,
    ).toBe('minimum-weight');
  });

  it('starts diet illness, blocks play, and cures with two doses', () => {
    const processor = new TamagotchiProcessor(new FakeClock(0));
    let tamagotchi = TamagotchiBuilder.hatched()
      .with({ happiness: 3, consecutiveSnacks: 2 })
      .build();

    const snack = processor.command(tamagotchi, { type: 'feedSnack' });
    tamagotchi = snack.tamagotchi;
    expect(tamagotchi.snapshot().illness?.cause).toBe('diet');
    expect(
      processor.command(tamagotchi, { type: 'play', result: 'win' }).rejection,
    ).toBe('sick');

    tamagotchi = processor.command(tamagotchi, {
      type: 'giveMedicine',
    }).tamagotchi;
    expect(tamagotchi.snapshot().illness?.medicineDoses).toBe(1);

    tamagotchi = processor.command(tamagotchi, {
      type: 'giveMedicine',
    }).tamagotchi;
    expect(tamagotchi.snapshot().illness).toBeNull();
  });

  it('requires cleaning before hygiene medicine can cure', () => {
    const processor = new TamagotchiProcessor(new FakeClock(0));
    let tamagotchi = TamagotchiBuilder.hatched()
      .with({
        poopCount: 3,
        illness: {
          cause: 'hygiene',
          startedAt: 0,
          medicineDoses: 1,
          nextDamageAt: HOUR,
        },
      })
      .build();

    expect(
      processor.command(tamagotchi, { type: 'giveMedicine' }).rejection,
    ).toBe('requires-cleaning');

    tamagotchi = processor.command(tamagotchi, { type: 'clean' }).tamagotchi;
    const cure = processor.command(tamagotchi, { type: 'giveMedicine' });
    expect(cure.accepted).toBe(true);
    expect(cure.tamagotchi.snapshot().illness).toBeNull();
  });

  it('records a care mistake at the exact attention deadline', () => {
    const tamagotchi = TamagotchiBuilder.hatched('child')
      .with({
        hunger: 0,
        attention: {
          reason: 'hunger',
          openedAt: 0,
          expiresAt: 15 * MINUTE,
        },
      })
      .build();
    const state = new TamagotchiProcessor(new FakeClock(15 * MINUTE))
      .process(tamagotchi)
      .snapshot();

    expect(state.careMistakes).toBe(1);
    expect(state.stageStats.careMistakes).toBe(1);
    expect(state.attention).toBeNull();
    expect(state.attentionCooldowns.hunger).toBe(75 * MINUTE);
  });

  it('accepts discipline only during its attention call', () => {
    const clock = new FakeClock(30 * MINUTE);
    const processor = new TamagotchiProcessor(clock);
    const child = TamagotchiBuilder.hatched('child').build();
    const waiting = processor.process(child);

    expect(waiting.snapshot().attention?.reason).toBe('discipline');

    const result = processor.command(waiting, { type: 'discipline' });
    expect(result.accepted).toBe(true);
    expect(result.tamagotchi.snapshot()).toMatchObject({
      discipline: 1,
      attention: null,
      schedules: { nextDisciplineAt: 6.5 * HOUR },
    });
    expect(
      processor.command(result.tamagotchi, { type: 'discipline' }).rejection,
    ).toBe('no-discipline-call');
  });

  it('sleeps on command and pauses need schedules', () => {
    const nextNeedAt = 10 * DAY;
    const clock = new FakeClock(HOUR);
    const processor = new TamagotchiProcessor(clock);
    let tamagotchi = TamagotchiBuilder.hatched('child')
      .with({
        schedules: {
          nextHungerAt: nextNeedAt,
          nextHappinessAt: nextNeedAt,
          nextPoopAt: nextNeedAt,
          nextSleepAt: HOUR,
        },
      })
      .build();

    tamagotchi = processor.process(tamagotchi);
    expect(tamagotchi.snapshot().attention?.reason).toBe('sleep');

    const result = processor.command(tamagotchi, { type: 'turnLightsOff' });
    const state = result.tamagotchi.snapshot();
    expect(state.behavior).toBe('sleeping');
    expect(state.lightsOn).toBe(false);
    expect(state.schedules.wakeAt).toBe(9 * HOUR);
    expect(state.schedules.nextHungerAt).toBe(nextNeedAt + 8 * HOUR);
  });

  it('auto-sleeps and records a mistake when the sleep call expires', () => {
    const tamagotchi = TamagotchiBuilder.hatched('child')
      .with({
        attention: {
          reason: 'sleep',
          openedAt: 0,
          expiresAt: 15 * MINUTE,
        },
        schedules: { nextSleepAt: 0 },
      })
      .build();
    const state = new TamagotchiProcessor(new FakeClock(15 * MINUTE))
      .process(tamagotchi)
      .snapshot();

    expect(state.behavior).toBe('sleeping');
    expect(state.careMistakes).toBe(1);
  });

  it('evolves only when the stage boundary is reached', () => {
    const clock = new FakeClock(HOUR - 1);
    const processor = new TamagotchiProcessor(clock);
    const baby = TamagotchiBuilder.hatched('baby')
      .with({
        schedules: {
          nextHungerAt: 10 * DAY,
          nextHappinessAt: 10 * DAY,
          nextPoopAt: 10 * DAY,
        },
      })
      .build();

    expect(processor.process(baby).snapshot().stage).toBe('baby');

    clock.set(HOUR);
    const child = processor.process(baby).snapshot();
    expect(child.stage).toBe('child');
    expect(child.weight).toBe(10);
    expect(child.evolutionHistory[0]).toMatchObject({
      fromStage: 'baby',
      toStage: 'child',
      at: HOUR,
      score: 8,
      profile: 'thriving',
    });
  });

  it('applies illness death before evolution at the same boundary', () => {
    const tamagotchi = TamagotchiBuilder.hatched('baby')
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
    const state = new TamagotchiProcessor(new FakeClock(HOUR))
      .process(tamagotchi)
      .snapshot();

    expect(state.behavior).toBe('dead');
    expect(state.stage).toBe('baby');
    expect(state.evolutionHistory).toHaveLength(0);
  });

  it('handles a large offline interval and stops once dead', () => {
    const tamagotchi = Tamagotchi.create(TamagotchiId.create('pet-1'));
    const state = new TamagotchiProcessor(new FakeClock(15 * DAY))
      .process(tamagotchi)
      .snapshot();

    expect(state.behavior).toBe('dead');
    expect(state.lastProcessedAt).toBeLessThanOrEqual(15 * DAY);
  });

  it('produces equal snapshots for equal state and clock values', () => {
    const first = TamagotchiBuilder.hatched('teen').build();
    const second = Tamagotchi.restore(first.snapshot());
    const clock = new FakeClock(6 * HOUR);

    expect(new TamagotchiProcessor(clock).process(first).snapshot()).toEqual(
      new TamagotchiProcessor(clock).process(second).snapshot(),
    );
  });

  it('opens simultaneous attention using documented priority', () => {
    const tamagotchi = TamagotchiBuilder.hatched('child')
      .with({
        hunger: 0,
        poopCount: 3,
        illness: {
          cause: 'diet',
          startedAt: 0,
          medicineDoses: 0,
          nextDamageAt: HOUR,
        },
      })
      .build();

    expect(
      new TamagotchiProcessor(new FakeClock(0)).process(tamagotchi).snapshot()
        .attention?.reason,
    ).toBe('sickness');
  });
});
