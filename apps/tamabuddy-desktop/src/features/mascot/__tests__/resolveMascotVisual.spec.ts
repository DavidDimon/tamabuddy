import type { DesktopPet } from '../../../entities/pet/index.js';
import { resolveMascotVisual } from '../resolveMascotVisual.js';

describe('resolveMascotVisual', () => {
  const egg: DesktopPet = {
    behavior: 'egg',
    createdAt: 0,
    happiness: 4,
    health: 4,
    hunger: 4,
    isIll: false,
    lastProcessedAt: 0,
    needsAttention: false,
    poopCount: 0,
    stage: 'egg',
  };
  const awake: DesktopPet = {
    ...egg,
    stage: 'child',
    behavior: 'idle',
    lastProcessedAt: 60_000,
  };

  it('keeps terminal behaviors above need presentation', () => {
    expect(resolveMascotVisual(egg)).toBe('idle');
    expect(resolveMascotVisual({ ...awake, behavior: 'dead' })).toBe('dead');
  });

  it('prioritizes illness, dirt, attention, hunger, and sadness', () => {
    expect(
      resolveMascotVisual({
        ...awake,
        isIll: true,
        poopCount: 1,
      }),
    ).toBe('sick');
    expect(resolveMascotVisual({ ...awake, poopCount: 1 })).toBe('dirty');
    expect(
      resolveMascotVisual({
        ...awake,
        needsAttention: true,
      }),
    ).toBe('attention');
    expect(resolveMascotVisual({ ...awake, hunger: 0 })).toBe('hungry');
    expect(resolveMascotVisual({ ...awake, happiness: 0 })).toBe('sad');
  });
});
