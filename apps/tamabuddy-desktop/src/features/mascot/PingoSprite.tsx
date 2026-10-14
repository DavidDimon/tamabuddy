import type { DesktopPet } from '../../entities/pet/index.js';
import { PINGO_MANIFEST } from './catalog/pingo.js';
import { MascotSprite } from './MascotSprite.js';
import type { MascotVisualKey } from './mascotManifest.js';

export interface PingoSpriteProps {
  readonly reaction?: MascotVisualKey | null;
  readonly state: DesktopPet;
}

export function PingoSprite(props: PingoSpriteProps) {
  return <MascotSprite {...props} manifest={PINGO_MANIFEST} />;
}
