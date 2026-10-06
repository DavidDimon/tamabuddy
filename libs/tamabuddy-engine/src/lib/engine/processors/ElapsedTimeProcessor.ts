import { Clock } from '../../application/ports/Clock.js';

export interface ElapsedTimeWindow {
  readonly from: number;
  readonly to: number;
  readonly elapsed: number;
}

export class ElapsedTimeProcessor {
  constructor(private readonly clock: Clock) {}

  process(from: number): ElapsedTimeWindow {
    const to = this.clock.now();

    if (!Number.isFinite(from) || from > to) {
      throw new RangeError('Elapsed time requires a finite past timestamp');
    }

    return { from, to, elapsed: to - from };
  }
}
