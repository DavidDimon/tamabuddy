import type { DesktopPetAction } from '../../../entities/pet/index.js';

import { resolveMascotReaction } from '../resolveMascotReaction.js';

describe('resolveMascotReaction', () => {
  it.each<[DesktopPetAction, string | null]>([
    ['feedMeal', 'eatingMeal'],
    ['feedSnack', 'eatingSnack'],
    ['play', 'playing'],
    ['clean', 'cleaning'],
    ['giveMedicine', 'medicine'],
    ['discipline', 'discipline'],
    ['turnLightsOff', null],
  ])('maps an accepted %s action to its reaction', (action, expected) => {
    expect(resolveMascotReaction(action, true)).toBe(expected);
  });

  it('does not react to a rejected command', () => {
    expect(resolveMascotReaction('feedMeal', false)).toBeNull();
  });
});
