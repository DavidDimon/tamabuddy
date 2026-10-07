import type { TamabuddyState } from '@tamabuddy/tamabuddy-engine';

import type { MascotVisualKey } from './mascotManifest.js';

export type StableMascotVisual = Extract<
  MascotVisualKey,
  | 'idle'
  | 'sad'
  | 'hungry'
  | 'attention'
  | 'dirty'
  | 'sick'
  | 'sleeping'
  | 'dead'
>;

export function resolveMascotVisual(state: TamabuddyState): StableMascotVisual {
  if (state.behavior === 'dead') return 'dead';
  if (state.behavior === 'egg') return 'idle';
  if (state.behavior === 'sleeping') return 'sleeping';
  if (state.illness !== null) return 'sick';
  if (state.poopCount > 0) return 'dirty';
  if (state.attention !== null) return 'attention';
  if (state.hunger === 0) return 'hungry';
  if (state.happiness === 0) return 'sad';
  return 'idle';
}
