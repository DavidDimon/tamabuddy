import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';

import { resolveMascotVisual } from '../resolveMascotVisual.js';

describe('resolveMascotVisual', () => {
  const egg = Tamabuddy.create(TamabuddyId.create('pingo'), 0).snapshot();
  const awake = {
    ...egg,
    stage: 'child' as const,
    behavior: 'idle' as const,
    hatchedAt: 60_000,
    stageStartedAt: 60_000,
    lastProcessedAt: 60_000,
    hunger: 4,
    happiness: 4,
    weight: 10,
  };

  it('keeps terminal behaviors above need presentation', () => {
    expect(resolveMascotVisual(egg)).toBe('egg');
    expect(resolveMascotVisual({ ...awake, behavior: 'dead' })).toBe('dead');
  });

  it('prioritizes illness, dirt, attention, hunger, and sadness', () => {
    expect(
      resolveMascotVisual({
        ...awake,
        illness: {
          cause: 'weakness',
          startedAt: 60_000,
          medicineDoses: 0,
          nextDamageAt: 3_660_000,
        },
        poopCount: 1,
      }),
    ).toBe('sick');
    expect(resolveMascotVisual({ ...awake, poopCount: 1 })).toBe('dirty');
    expect(
      resolveMascotVisual({
        ...awake,
        attention: {
          reason: 'happiness',
          openedAt: 60_000,
          expiresAt: 120_000,
        },
      }),
    ).toBe('attention');
    expect(resolveMascotVisual({ ...awake, hunger: 0 })).toBe('hungry');
    expect(resolveMascotVisual({ ...awake, happiness: 0 })).toBe('sad');
  });
});
