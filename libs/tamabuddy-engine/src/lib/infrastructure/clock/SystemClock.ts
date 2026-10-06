import { Clock } from '../../application/ports/Clock.js';

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
