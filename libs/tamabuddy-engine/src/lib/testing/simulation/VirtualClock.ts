import { Clock } from '../../application/ports/Clock.js';
import { assertDuration } from './durations.js';

export class VirtualClock implements Clock {
  private currentTime: number;

  constructor(initialTime = 0) {
    assertTimestamp(initialTime, 'initialTime');
    this.currentTime = initialTime;
  }

  now(): number {
    return this.currentTime;
  }

  set(timestamp: number): void {
    assertTimestamp(timestamp, 'timestamp');
    if (timestamp < this.currentTime) {
      throw new RangeError('VirtualClock cannot move backwards');
    }
    this.currentTime = timestamp;
  }

  advanceBy(duration: number): void {
    assertDuration(duration, 'duration');
    const target = this.currentTime + duration;
    assertTimestamp(target, 'target timestamp');
    this.currentTime = target;
  }
}

function assertTimestamp(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer timestamp`);
  }
}
