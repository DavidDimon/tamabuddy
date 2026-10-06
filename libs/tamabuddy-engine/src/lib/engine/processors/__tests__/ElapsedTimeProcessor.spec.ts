import { ElapsedTimeProcessor } from '../ElapsedTimeProcessor.js';
import { FakeClock } from '../../../application/ports/__mocks__/FakeClock.mock.js';

describe('ElapsedTimeProcessor', () => {
  it('uses an injected clock to calculate elapsed time', () => {
    const clock = new FakeClock(5_000);

    expect(new ElapsedTimeProcessor(clock).process(3_200)).toEqual({
      from: 3_200,
      to: 5_000,
      elapsed: 1_800,
    });

    clock.set(6_000);
    expect(new ElapsedTimeProcessor(clock).process(5_000).elapsed).toBe(1_000);
  });

  it('rejects a timestamp after the injected current time', () => {
    const processor = new ElapsedTimeProcessor(new FakeClock(5_000));

    expect(() => processor.process(5_001)).toThrow(
      'Elapsed time requires a finite past timestamp',
    );
  });
});
