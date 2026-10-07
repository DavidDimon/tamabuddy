import { useEffect, useState } from 'react';

import type { TamabuddyState } from '@tamabuddy/tamabuddy-engine';

import type {
  MascotAnimation,
  MascotManifest,
  MascotVisualKey,
} from './mascotManifest.js';
import { resolveMascotVisual } from './resolveMascotVisual.js';

export interface MascotSpriteProps {
  readonly manifest: MascotManifest;
  readonly reaction?: MascotVisualKey | null;
  readonly state: TamabuddyState;
}

export function MascotSprite({
  manifest,
  reaction = null,
  state,
}: MascotSpriteProps) {
  const visual = reaction ?? resolveMascotVisual(state);
  const animation = manifest.stages[state.stage].animations[visual];
  const frameIndex = useAnimationFrame(animation);

  return (
    <figure
      className={`mascot mascot--${visual}`}
      data-mascot={manifest.id}
      data-visual={visual}
    >
      {state.attention === null ? null : (
        <span
          className="mascot__attention"
          aria-label={`${manifest.name} quer atenção`}
        >
          !
        </span>
      )}
      <pre className="mascot__art" aria-hidden="true">
        {animation.frames[frameIndex].art}
      </pre>
      <figcaption className="mascot__caption" aria-live="polite">
        {animation.label}
      </figcaption>
      <span className="sr-only">{animation.description}</span>
    </figure>
  );
}

function useAnimationFrame(animation: MascotAnimation): number {
  const reducedMotion = useReducedMotion();
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
    if (reducedMotion || animation.frames.length < 2) return;

    let nextFrame = 0;
    const interval = window.setInterval(() => {
      nextFrame += 1;
      if (animation.loop) {
        nextFrame %= animation.frames.length;
      } else if (nextFrame >= animation.frames.length - 1) {
        nextFrame = animation.frames.length - 1;
        window.clearInterval(interval);
      }
      setFrameIndex(nextFrame);
    }, 1000 / animation.fps);

    return () => window.clearInterval(interval);
  }, [animation, reducedMotion]);

  return frameIndex;
}

function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}
