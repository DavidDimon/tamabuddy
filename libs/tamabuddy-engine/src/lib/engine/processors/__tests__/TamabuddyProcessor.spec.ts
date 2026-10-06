import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { DAY, HOUR, MINUTE } from '../../../domain/rules/stageRules.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';
import { FakeClock } from '../../../application/ports/__mocks__/FakeClock.mock.js';
import { TamabuddyBuilder } from '../__mocks__/TamabuddyBuilder.mock.js';
import { TamabuddyProcessor } from '../TamabuddyProcessor.js';

describe('TamabuddyProcessor', () => {
  it('hatches at five minutes and applies stage decay deterministically', () => {
    const clock = new FakeClock(5 * MINUTE - 1);
    const processor = new TamabuddyProcessor(clock);
    const egg = Tamabuddy.create(TamabuddyId.create('pet-1'));

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
    const processor = new TamabuddyProcessor(clock);
    let tamabuddy = Tamabuddy.create(TamabuddyId.create('pet-1'));

    const meal = processor.command(tamabuddy, { type: 'feedMeal' });
    tamabuddy = meal.tamabuddy;
    expect(meal.accepted).toBe(true);
    expect(tamabuddy.snapshot()).toMatchObject({ hunger: 4, weight: 6 });

    expect(processor.command(tamabuddy, { type: 'feedMeal' }).rejection).toBe(
      'not-hungry',
    );

    const play = processor.command(tamabuddy, {
      type: 'play',
      result: 'win',
    });
    expect(play.accepted).toBe(true);
    expect(play.tamabuddy.snapshot()).toMatchObject({
      happiness: 4,
      weight: 5,
    });
    expect(
      processor.command(play.tamabuddy, {
        type: 'play',
        result: 'loss',
      }).rejection,
    ).toBe('minimum-weight');
  });

  it('starts diet illness, blocks play, and cures with two doses', () => {
    const processor = new TamabuddyProcessor(new FakeClock(0));
    let tamabuddy = TamabuddyBuilder.hatched()
      .with({ happiness: 3, consecutiveSnacks: 2 })
      .build();

    const snack = processor.command(tamabuddy, { type: 'feedSnack' });
    tamabuddy = snack.tamabuddy;
    expect(tamabuddy.snapshot().illness?.cause).toBe('diet');
    expect(
      processor.command(tamabuddy, { type: 'play', result: 'win' }).rejection,
    ).toBe('sick');

    tamabuddy = processor.command(tamabuddy, {
      type: 'giveMedicine',
    }).tamabuddy;
    expect(tamabuddy.snapshot().illness?.medicineDoses).toBe(1);

    tamabuddy = processor.command(tamabuddy, {
      type: 'giveMedicine',
    }).tamabuddy;
    expect(tamabuddy.snapshot().illness).toBeNull();
  });

  it('requires cleaning before hygiene medicine can cure', () => {
    const processor = new TamabuddyProcessor(new FakeClock(0));
    let tamabuddy = TamabuddyBuilder.hatched()
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
      processor.command(tamabuddy, { type: 'giveMedicine' }).rejection,
    ).toBe('requires-cleaning');

    tamabuddy = processor.command(tamabuddy, { type: 'clean' }).tamabuddy;
    const cure = processor.command(tamabuddy, { type: 'giveMedicine' });
    expect(cure.accepted).toBe(true);
    expect(cure.tamabuddy.snapshot().illness).toBeNull();
  });

  it('records a care mistake at the exact attention deadline', () => {
    const tamabuddy = TamabuddyBuilder.hatched('child')
      .with({
        hunger: 0,
        attention: {
          reason: 'hunger',
          openedAt: 0,
          expiresAt: 15 * MINUTE,
        },
      })
      .build();
    const state = new TamabuddyProcessor(new FakeClock(15 * MINUTE))
      .process(tamabuddy)
      .snapshot();

    expect(state.careMistakes).toBe(1);
    expect(state.stageStats.careMistakes).toBe(1);
    expect(state.attention).toBeNull();
    expect(state.attentionCooldowns.hunger).toBe(75 * MINUTE);
  });

  it('accepts discipline only during its attention call', () => {
    const clock = new FakeClock(30 * MINUTE);
    const processor = new TamabuddyProcessor(clock);
    const child = TamabuddyBuilder.hatched('child').build();
    const waiting = processor.process(child);

    expect(waiting.snapshot().attention?.reason).toBe('discipline');
    expect(waiting.snapshot().schedules.nextDisciplineAt).toBeNull();

    const result = processor.command(waiting, { type: 'discipline' });
    expect(result.accepted).toBe(true);
    expect(result.tamabuddy.snapshot()).toMatchObject({
      discipline: 1,
      attention: null,
      schedules: { nextDisciplineAt: 6.5 * HOUR },
    });
    expect(
      processor.command(result.tamabuddy, { type: 'discipline' }).rejection,
    ).toBe('no-discipline-call');
  });

  it('keeps an active discipline call valid between opening and deadline', () => {
    const clock = new FakeClock(30 * MINUTE);
    const processor = new TamabuddyProcessor(clock);
    const waiting = processor.process(
      TamabuddyBuilder.hatched('child').build(),
    );

    clock.set(31 * MINUTE);
    const state = processor.process(waiting).snapshot();

    expect(state.attention).toMatchObject({
      reason: 'discipline',
      openedAt: 30 * MINUTE,
      expiresAt: 45 * MINUTE,
    });
    expect(state.schedules.nextDisciplineAt).toBeNull();
  });

  it('sleeps on command and pauses need schedules', () => {
    const nextNeedAt = 10 * DAY;
    const clock = new FakeClock(HOUR);
    const processor = new TamabuddyProcessor(clock);
    let tamabuddy = TamabuddyBuilder.hatched('child')
      .with({
        schedules: {
          nextHungerAt: nextNeedAt,
          nextHappinessAt: nextNeedAt,
          nextPoopAt: nextNeedAt,
          nextSleepAt: HOUR,
        },
      })
      .build();

    tamabuddy = processor.process(tamabuddy);
    expect(tamabuddy.snapshot().attention?.reason).toBe('sleep');

    const result = processor.command(tamabuddy, { type: 'turnLightsOff' });
    const state = result.tamabuddy.snapshot();
    expect(state.behavior).toBe('sleeping');
    expect(state.lightsOn).toBe(false);
    expect(state.schedules.wakeAt).toBe(9 * HOUR);
    expect(state.schedules.nextHungerAt).toBe(nextNeedAt + 8 * HOUR);
  });

  it('auto-sleeps and records a mistake when the sleep call expires', () => {
    const tamabuddy = TamabuddyBuilder.hatched('child')
      .with({
        attention: {
          reason: 'sleep',
          openedAt: 0,
          expiresAt: 15 * MINUTE,
        },
        schedules: { nextSleepAt: 0 },
      })
      .build();
    const state = new TamabuddyProcessor(new FakeClock(15 * MINUTE))
      .process(tamabuddy)
      .snapshot();

    expect(state.behavior).toBe('sleeping');
    expect(state.careMistakes).toBe(1);
  });

  it('evolves only when the stage boundary is reached', () => {
    const clock = new FakeClock(HOUR - 1);
    const processor = new TamabuddyProcessor(clock);
    const baby = TamabuddyBuilder.hatched('baby')
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
    const tamabuddy = TamabuddyBuilder.hatched('baby')
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
    const state = new TamabuddyProcessor(new FakeClock(HOUR))
      .process(tamabuddy)
      .snapshot();

    expect(state.behavior).toBe('dead');
    expect(state.stage).toBe('baby');
    expect(state.evolutionHistory).toHaveLength(0);
  });

  it('handles a large offline interval and stops once dead', () => {
    const tamabuddy = Tamabuddy.create(TamabuddyId.create('pet-1'));
    const state = new TamabuddyProcessor(new FakeClock(15 * DAY))
      .process(tamabuddy)
      .snapshot();

    expect(state.behavior).toBe('dead');
    expect(state.lastProcessedAt).toBeLessThanOrEqual(15 * DAY);
  });

  it('produces equal snapshots for equal state and clock values', () => {
    const first = TamabuddyBuilder.hatched('teen').build();
    const second = Tamabuddy.restore(first.snapshot());
    const clock = new FakeClock(6 * HOUR);

    expect(new TamabuddyProcessor(clock).process(first).snapshot()).toEqual(
      new TamabuddyProcessor(clock).process(second).snapshot(),
    );
  });

  it('produces the same final snapshot through traced and legacy processing', () => {
    const initial = TamabuddyBuilder.hatched('child').build();
    const clock = new FakeClock(6 * HOUR);
    const processor = new TamabuddyProcessor(clock);

    const legacy = processor.process(initial).snapshot();
    const traced = processor.processWithTrace(initial);

    expect(traced.tamabuddy.snapshot()).toEqual(legacy);
    expect(traced.trace.length).toBeGreaterThan(1);
  });

  it('records ordered intermediate boundaries across a long interval', () => {
    const processor = new TamabuddyProcessor(new FakeClock(2 * HOUR));
    const egg = Tamabuddy.create(TamabuddyId.create('pet-1'));

    const { trace } = processor.processWithTrace(egg);
    const timestamps = trace.map((entry) => entry.at);

    expect(timestamps).toContain(5 * MINUTE);
    expect(timestamps).toContain(35 * MINUTE);
    expect(timestamps).toContain(65 * MINUTE);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    expect(trace.find((entry) => entry.at === 5 * MINUTE)?.after.stage).toBe(
      'baby',
    );
    expect(trace.find((entry) => entry.at === 65 * MINUTE)?.after.stage).toBe(
      'child',
    );
  });

  it('ends a trace at the exact death boundary', () => {
    const tamabuddy = TamabuddyBuilder.hatched('baby')
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

    const result = new TamabuddyProcessor(
      new FakeClock(3 * HOUR),
    ).processWithTrace(tamabuddy);
    const lastEntry = result.trace.at(-1);

    expect(lastEntry?.at).toBe(HOUR);
    expect(lastEntry?.after.behavior).toBe('dead');
    expect(result.tamabuddy.snapshot().lastProcessedAt).toBe(HOUR);
  });

  it('captures same-timestamp death before evolution in one boundary', () => {
    const tamabuddy = TamabuddyBuilder.hatched('baby')
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

    const trace = new TamabuddyProcessor(new FakeClock(HOUR)).processWithTrace(
      tamabuddy,
    ).trace;
    const boundary = trace.find((entry) => entry.at === HOUR);

    expect(boundary?.before.stage).toBe('baby');
    expect(boundary?.after).toMatchObject({
      stage: 'baby',
      behavior: 'dead',
      evolutionHistory: [],
    });
  });

  it('returns an empty trace when processing makes no change', () => {
    const tamabuddy = TamabuddyBuilder.hatched('baby').build();

    expect(
      new TamabuddyProcessor(new FakeClock(0)).processWithTrace(tamabuddy)
        .trace,
    ).toEqual([]);
  });

  it('separates automatic boundary changes from a command observation', () => {
    const tamabuddy = TamabuddyBuilder.hatched('baby').build();
    const result = new TamabuddyProcessor(
      new FakeClock(30 * MINUTE),
    ).commandWithTrace(tamabuddy, { type: 'feedMeal' });

    expect(result.processingTrace.at(-1)?.after.hunger).toBe(3);
    expect(result.commandTrace).toMatchObject({
      at: 30 * MINUTE,
      command: { type: 'feedMeal' },
      accepted: true,
      before: { hunger: 3 },
      after: { hunger: 4 },
    });
    expect(result.tamabuddy.snapshot().hunger).toBe(4);
  });

  it('keeps trace snapshots independent from the result and each other', () => {
    const egg = Tamabuddy.create(TamabuddyId.create('pet-1'));
    const result = new TamabuddyProcessor(
      new FakeClock(35 * MINUTE),
    ).processWithTrace(egg);
    const hatch = result.trace.find((entry) => entry.at === 5 * MINUTE);

    if (hatch === undefined) throw new Error('Expected hatch trace entry');
    const schedules = hatch.after.schedules as {
      nextHungerAt: number | null;
    };
    schedules.nextHungerAt = null;

    expect(hatch.before.schedules.nextHungerAt).toBeNull();
    expect(result.tamabuddy.snapshot().schedules.nextHungerAt).not.toBeNull();
  });

  it('opens simultaneous attention using documented priority', () => {
    const tamabuddy = TamabuddyBuilder.hatched('child')
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
      new TamabuddyProcessor(new FakeClock(0)).process(tamabuddy).snapshot()
        .attention?.reason,
    ).toBe('sickness');
  });
});
