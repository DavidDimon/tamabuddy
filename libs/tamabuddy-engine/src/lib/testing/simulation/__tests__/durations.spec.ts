import { days, hours, minutes } from '../durations.js';
import { VirtualClock } from '../VirtualClock.js';

describe('simulation durations', () => {
  it('creates integer millisecond durations from fractional units', () => {
    expect(minutes(1.5)).toBe(90_000);
    expect(hours(0.5)).toBe(1_800_000);
    expect(days(2)).toBe(172_800_000);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 1 / 7])(
    'rejects invalid duration %s',
    (value) => {
      expect(() => minutes(value)).toThrow(RangeError);
    },
  );
});

describe('VirtualClock', () => {
  it('advances deterministically and refuses backwards time', () => {
    const clock = new VirtualClock(100);

    clock.advanceBy(50);
    expect(clock.now()).toBe(150);
    expect(() => clock.set(149)).toThrow('cannot move backwards');
  });
});
