import type { DesktopPetAction } from '../../entities/pet/index.js';
import type { MascotVisualKey } from './mascotManifest.js';

export type MascotReaction = Extract<
  MascotVisualKey,
  | 'eatingMeal'
  | 'eatingSnack'
  | 'playing'
  | 'cleaning'
  | 'medicine'
  | 'discipline'
  | 'evolving'
>;

export function resolveMascotReaction(
  action: DesktopPetAction,
  accepted: boolean,
): MascotReaction | null {
  if (!accepted) return null;

  switch (action) {
    case 'feedMeal':
      return 'eatingMeal';
    case 'feedSnack':
      return 'eatingSnack';
    case 'play':
      return 'playing';
    case 'clean':
      return 'cleaning';
    case 'giveMedicine':
      return 'medicine';
    case 'discipline':
      return 'discipline';
    case 'turnLightsOff':
      return null;
  }
}
