import { RandomSource } from './RandomSource.js';

export const SEEDED_RANDOM_VERSION = 'mulberry32-v1' as const;

const UINT32_RANGE = 0x1_0000_0000;
const STATE_INCREMENT = 0x6d2b_79f5;

export class Mulberry32RandomSource implements RandomSource {
  private state: number;

  constructor(readonly seed: number) {
    assertSeed(seed);
    this.state = seed;
  }

  next(): number {
    this.state = (this.state + STATE_INCREMENT) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  }
}

export function assertSeed(seed: number): void {
  if (!Number.isInteger(seed) || seed < 0 || seed >= UINT32_RANGE) {
    throw new RangeError('Random seed must be a uint32 integer');
  }
}
