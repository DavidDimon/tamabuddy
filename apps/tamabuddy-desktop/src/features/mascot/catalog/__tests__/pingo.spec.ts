import type { Stage } from '@tamabuddy/tamabuddy-engine';

import { PINGO_STAGE_ART } from '../pingo.js';

describe('PINGO_STAGE_ART', () => {
  it('provides a non-empty fallback for every engine stage', () => {
    const stages: readonly Stage[] = [
      'egg',
      'baby',
      'child',
      'teen',
      'adult',
      'elder',
    ];

    expect(Object.keys(PINGO_STAGE_ART)).toEqual(stages);
    for (const stage of stages) {
      const frame = PINGO_STAGE_ART[stage].art;
      const lines = frame.split('\n');

      expect(frame.trim()).not.toBe('');
      expect(PINGO_STAGE_ART[stage].description).not.toBe('');
      expect(lines.length).toBeLessThanOrEqual(16);
      expect(
        Math.max(...lines.map((line) => [...line].length)),
      ).toBeLessThanOrEqual(24);
    }
  });
});
