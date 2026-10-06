const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function minutes(value: number): number {
  return duration(value, MINUTE, 'minutes');
}

export function hours(value: number): number {
  return duration(value, HOUR, 'hours');
}

export function days(value: number): number {
  return duration(value, DAY, 'days');
}

export function assertDuration(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer duration`);
  }
}

function duration(value: number, unit: number, name: string): number {
  const milliseconds = value * unit;
  assertDuration(milliseconds, name);
  return milliseconds;
}
