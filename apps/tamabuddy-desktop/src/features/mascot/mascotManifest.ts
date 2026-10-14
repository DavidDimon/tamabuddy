import type { DesktopPetStage } from '../../entities/pet/index.js';

export const MASCOT_VISUAL_KEYS = [
  'idle',
  'happy',
  'sad',
  'hungry',
  'sleeping',
  'playing',
  'eatingMeal',
  'eatingSnack',
  'cleaning',
  'dirty',
  'sick',
  'medicine',
  'discipline',
  'attention',
  'evolving',
  'dead',
] as const;

export type MascotVisualKey = (typeof MASCOT_VISUAL_KEYS)[number];

export interface MascotFrame {
  readonly art: string;
}

export interface MascotAnimation {
  readonly description: string;
  readonly fps: number;
  readonly frames: readonly MascotFrame[];
  readonly label: string;
  readonly loop: boolean;
}

export interface MascotStageManifest {
  readonly animations: Readonly<Record<MascotVisualKey, MascotAnimation>>;
}

export interface MascotManifest {
  readonly id: string;
  readonly name: string;
  readonly canvas: {
    readonly width: number;
    readonly height: number;
  };
  readonly colors: {
    readonly primary: string;
    readonly secondary: string;
    readonly highlight: string;
  };
  readonly stages: Readonly<Record<DesktopPetStage, MascotStageManifest>>;
}
