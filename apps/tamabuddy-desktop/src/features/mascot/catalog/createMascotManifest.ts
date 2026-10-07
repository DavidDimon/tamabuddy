import type { Stage } from '@tamabuddy/tamabuddy-engine';

import {
  MASCOT_VISUAL_KEYS,
  type MascotAnimation,
  type MascotManifest,
  type MascotVisualKey,
} from '../mascotManifest.js';

export interface MascotStageDesign {
  readonly body: readonly string[];
  readonly description: string;
}

export interface MascotVisualDesign {
  readonly description: string;
  readonly eyes?: string;
  readonly mouth?: string;
  readonly topCues: readonly string[];
  readonly bottomCue?: string;
  readonly fps: number;
  readonly loop: boolean;
}

export interface MascotManifestDesign {
  readonly id: string;
  readonly name: string;
  readonly canvas: MascotManifest['canvas'];
  readonly colors: MascotManifest['colors'];
  readonly stages: Readonly<Record<Stage, MascotStageDesign>>;
  readonly visuals: Readonly<Record<MascotVisualKey, MascotVisualDesign>>;
}

const STAGES: readonly Stage[] = [
  'egg',
  'baby',
  'child',
  'teen',
  'adult',
  'elder',
];

export function createMascotManifest<const Design extends MascotManifestDesign>(
  design: Design,
): MascotManifest & {
  readonly id: Design['id'];
  readonly name: Design['name'];
} {
  return {
    id: design.id,
    name: design.name,
    canvas: design.canvas,
    colors: design.colors,
    stages: mapStages((stage) => ({
      animations: mapVisuals((visual) =>
        createAnimation(design, design.stages[stage], design.visuals[visual]),
      ),
    })),
  };
}

function createAnimation(
  manifest: MascotManifestDesign,
  stage: MascotStageDesign,
  visual: MascotVisualDesign,
): MascotAnimation {
  return {
    description: `${manifest.name} ${visual.description}; sua forma é ${stage.description}.`,
    fps: visual.fps,
    frames: visual.topCues.map((topCue) => ({
      art: composeFrame(manifest.canvas, stage.body, visual, topCue),
    })),
    label: `${manifest.name} ${visual.description}.`,
    loop: visual.loop,
  };
}

function composeFrame(
  canvas: MascotManifest['canvas'],
  body: readonly string[],
  visual: MascotVisualDesign,
  topCue: string,
): string {
  const rows = Array.from({ length: canvas.height }, () =>
    ' '.repeat(canvas.width),
  );
  rows[0] = center(topCue, canvas.width);

  const expressedBody = body.map((row) =>
    row
      .split('o')
      .join(visual.eyes ?? 'o')
      .split('w')
      .join(visual.mouth ?? 'w'),
  );
  const bodyStart = canvas.height - 3 - expressedBody.length + 1;
  if (bodyStart < 1) {
    throw new RangeError(
      `Mascot body exceeds ${canvas.width} x ${canvas.height} canvas`,
    );
  }
  expressedBody.forEach((row, index) => {
    rows[bodyStart + index] = center(row, canvas.width);
  });

  if (visual.bottomCue !== undefined) {
    rows[canvas.height - 1] = center(visual.bottomCue, canvas.width);
  }
  return rows.join('\n');
}

function center(value: string, width: number): string {
  if (value.length > width) {
    throw new RangeError(`Mascot frame row exceeds ${width} cells`);
  }
  const left = Math.floor((width - value.length) / 2);
  return `${' '.repeat(left)}${value}${' '.repeat(width - left - value.length)}`;
}

function mapStages<T>(
  factory: (stage: Stage) => T,
): Readonly<Record<Stage, T>> {
  return Object.fromEntries(
    STAGES.map((stage) => [stage, factory(stage)]),
  ) as Record<Stage, T>;
}

function mapVisuals<T>(
  factory: (visual: MascotVisualKey) => T,
): Readonly<Record<MascotVisualKey, T>> {
  return Object.fromEntries(
    MASCOT_VISUAL_KEYS.map((visual) => [visual, factory(visual)]),
  ) as Record<MascotVisualKey, T>;
}
