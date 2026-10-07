import type { MascotManifest } from '../mascotManifest.js';
import { BROTO_MANIFEST } from './broto.js';
import { FAISCA_MANIFEST } from './faisca.js';
import { MIMO_MANIFEST } from './mimo.js';
import { NEXO_MANIFEST } from './nexo.js';
import { PINGO_MANIFEST } from './pingo.js';
import { SOMBRIN_MANIFEST } from './sombrin.js';

export const MASCOT_CATALOG = [
  PINGO_MANIFEST,
  FAISCA_MANIFEST,
  BROTO_MANIFEST,
  NEXO_MANIFEST,
  MIMO_MANIFEST,
  SOMBRIN_MANIFEST,
] as const satisfies readonly MascotManifest[];

export type MascotId = (typeof MASCOT_CATALOG)[number]['id'];

export function findMascotManifest(id: string): MascotManifest | undefined {
  return MASCOT_CATALOG.find((manifest) => manifest.id === id);
}
