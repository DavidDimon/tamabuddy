import type { TamabuddyState } from '@tamabuddy/tamabuddy-engine';

import { PINGO_STAGE_ART } from './catalog/pingo.js';
import {
  resolveMascotVisual,
  type MascotVisualState,
} from './resolveMascotVisual.js';

const STATE_LABELS: Readonly<Record<MascotVisualState, string>> = {
  egg: 'Pingo está se formando.',
  idle: 'Pingo observa tudo com curiosidade.',
  sad: 'Pingo parece triste.',
  hungry: 'Pingo está com fome.',
  attention: 'Pingo quer sua atenção.',
  dirty: 'Pingo precisa de limpeza.',
  sick: 'Pingo não está se sentindo bem.',
  sleeping: 'Pingo está dormindo.',
  dead: 'A jornada de Pingo chegou ao fim.',
};

export interface PingoSpriteProps {
  readonly state: TamabuddyState;
}

export function PingoSprite({ state }: PingoSpriteProps) {
  const visual = resolveMascotVisual(state);
  const stageArt = PINGO_STAGE_ART[state.stage];

  return (
    <figure className={`mascot mascot--${visual}`}>
      {state.attention === null ? null : (
        <span className="mascot__attention" aria-label="Pingo quer atenção">
          !
        </span>
      )}
      <pre className="mascot__art" aria-hidden="true">
        {stageArt.art}
      </pre>
      <figcaption className="mascot__caption" aria-live="polite">
        {STATE_LABELS[visual]}
      </figcaption>
      <span className="sr-only">{stageArt.description}</span>
    </figure>
  );
}
