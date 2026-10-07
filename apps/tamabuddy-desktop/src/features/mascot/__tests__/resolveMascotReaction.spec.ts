import type { TamabuddyCommand } from '@tamabuddy/tamabuddy-engine';

import { resolveMascotReaction } from '../resolveMascotReaction.js';

describe('resolveMascotReaction', () => {
  it.each<[TamabuddyCommand, string | null]>([
    [{ type: 'feedMeal' }, 'eatingMeal'],
    [{ type: 'feedSnack' }, 'eatingSnack'],
    [{ type: 'play', result: 'win' }, 'playing'],
    [{ type: 'clean' }, 'cleaning'],
    [{ type: 'giveMedicine' }, 'medicine'],
    [{ type: 'discipline' }, 'discipline'],
    [{ type: 'turnLightsOff' }, null],
  ])('maps an accepted $type command to its reaction', (command, expected) => {
    expect(resolveMascotReaction(command, true)).toBe(expected);
  });

  it('does not react to a rejected command', () => {
    expect(resolveMascotReaction({ type: 'feedMeal' }, false)).toBeNull();
  });
});
