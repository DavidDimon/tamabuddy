import {
  Mulberry32RandomSource,
  SEEDED_RANDOM_VERSION,
} from '../Mulberry32RandomSource.js';

describe('Mulberry32RandomSource', () => {
  it('locks the versioned sequence for a representative seed', () => {
    const source = new Mulberry32RandomSource(1);

    expect(SEEDED_RANDOM_VERSION).toBe('mulberry32-v1');
    expect(Array.from({ length: 5 }, () => source.next())).toEqual([
      0.6270739405881613, 0.002735721180215478, 0.5274470399599522,
      0.9810509674716741, 0.9683778982143849,
    ]);
  });

  it.each([-1, 0x1_0000_0000, 1.5, Number.NaN])(
    'rejects invalid seed %s',
    (seed) => {
      expect(() => new Mulberry32RandomSource(seed)).toThrow(
        'seed must be a uint32 integer',
      );
    },
  );
});
