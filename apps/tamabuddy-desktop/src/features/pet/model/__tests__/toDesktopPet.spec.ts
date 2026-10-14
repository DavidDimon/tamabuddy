import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';

import { toDesktopPet, toTamabuddyCommand } from '../toDesktopPet.js';

describe('desktop pet mapping', () => {
  it('exposes only presentation state', () => {
    const state = Tamabuddy.create(TamabuddyId.create('pet'), 100).snapshot();

    expect(toDesktopPet(state)).toEqual({
      behavior: 'egg',
      createdAt: 100,
      happiness: 0,
      health: 4,
      hunger: 0,
      isIll: false,
      lastProcessedAt: 100,
      needsAttention: false,
      poopCount: 0,
      stage: 'egg',
    });
  });

  it('maps deterministic desktop actions to engine commands', () => {
    expect(toTamabuddyCommand('feedMeal')).toEqual({ type: 'feedMeal' });
    expect(toTamabuddyCommand('clean')).toEqual({ type: 'clean' });
  });

  it('adds a game outcome when mapping play', () => {
    expect(toTamabuddyCommand('play')).toMatchObject({ type: 'play' });
  });
});
