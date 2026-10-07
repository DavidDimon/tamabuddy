import type { TamabuddyState } from '@tamabuddy/tamabuddy-engine';

import { PINGO_MANIFEST } from './catalog/pingo.js';
import { MascotSprite } from './MascotSprite.js';
import type { MascotVisualKey } from './mascotManifest.js';

export interface PingoSpriteProps {
  readonly reaction?: MascotVisualKey | null;
  readonly state: TamabuddyState;
}

export function PingoSprite(props: PingoSpriteProps) {
  return <MascotSprite {...props} manifest={PINGO_MANIFEST} />;
}
