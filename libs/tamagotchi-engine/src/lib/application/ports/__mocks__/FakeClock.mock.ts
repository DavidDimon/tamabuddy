import { Clock } from '../Clock.js';

export class FakeClock implements Clock {
  constructor(private currentTime: number) {}

  now(): number {
    return this.currentTime;
  }

  set(time: number): void {
    this.currentTime = time;
  }
}
