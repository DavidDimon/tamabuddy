import type { Stage } from '@tamabuddy/tamabuddy-engine';

import { MASCOT_VISUAL_KEYS } from '../../mascotManifest.js';
import { findMascotManifest, MASCOT_CATALOG } from '../index.js';

const STAGES: readonly Stage[] = [
  'egg',
  'baby',
  'child',
  'teen',
  'adult',
  'elder',
];

describe.each(MASCOT_CATALOG)('$name manifest', (manifest) => {
  it('provides every visual for every engine stage', () => {
    expect(Object.keys(manifest.stages)).toEqual(STAGES);

    for (const stage of STAGES) {
      expect(Object.keys(manifest.stages[stage].animations)).toEqual(
        MASCOT_VISUAL_KEYS,
      );
    }
  });

  it('keeps every frame inside the fixed terminal canvas', () => {
    const { height, width } = manifest.canvas;

    for (const stage of STAGES) {
      for (const visual of MASCOT_VISUAL_KEYS) {
        const animation = manifest.stages[stage].animations[visual];

        expect(animation.description).not.toBe('');
        expect(animation.label).toMatch(new RegExp(`^${manifest.name} `));
        expect(animation.fps).toBeGreaterThanOrEqual(1);
        expect(animation.fps).toBeLessThanOrEqual(6);
        expect(animation.frames.length).toBeGreaterThanOrEqual(1);
        expect(animation.frames.length).toBeLessThanOrEqual(3);

        for (const frame of animation.frames) {
          const lines = frame.art.split('\n');
          expect(lines).toHaveLength(height);
          for (const line of lines) expect([...line]).toHaveLength(width);
        }
      }
    }
  });

  it('keeps transient animations within their duration budget', () => {
    const transientVisuals = MASCOT_VISUAL_KEYS.filter(
      (visual) =>
        ![
          'idle',
          'sad',
          'hungry',
          'sleeping',
          'dirty',
          'sick',
          'attention',
        ].includes(visual),
    );

    for (const stage of STAGES) {
      for (const visual of transientVisuals) {
        const animation = manifest.stages[stage].animations[visual];
        const duration = (animation.frames.length - 1) / animation.fps;
        expect(duration).toBeLessThanOrEqual(visual === 'evolving' ? 3 : 1.5);
      }
    }
  });
});

describe('MASCOT_CATALOG', () => {
  it('keeps the approved family order and unique identities', () => {
    expect(MASCOT_CATALOG.map(({ id }) => id)).toEqual([
      'pingo',
      'faisca',
      'broto',
      'nexo',
      'mimo',
      'sombrin',
    ]);
    expect(new Set(MASCOT_CATALOG.map(({ name }) => name)).size).toBe(
      MASCOT_CATALOG.length,
    );
    expect(findMascotManifest('nexo')?.name).toBe('Nexo');
    expect(findMascotManifest('unknown')).toBeUndefined();
  });

  it('uses one shared canvas and portable ASCII frames', () => {
    for (const manifest of MASCOT_CATALOG) {
      expect(manifest.canvas).toEqual({ width: 24, height: 13 });
      for (const stage of STAGES) {
        for (const visual of MASCOT_VISUAL_KEYS) {
          for (const frame of manifest.stages[stage].animations[visual]
            .frames) {
            expect(frame.art).toMatch(/^[\x20-\x7e\n]+$/);
          }
        }
      }
    }
  });

  it('keeps every family silhouette distinct at equivalent stages', () => {
    for (const stage of STAGES) {
      const idleFrames = MASCOT_CATALOG.map(
        (manifest) => manifest.stages[stage].animations.idle.frames[0].art,
      );
      expect(new Set(idleFrames).size).toBe(MASCOT_CATALOG.length);
    }
  });
});
