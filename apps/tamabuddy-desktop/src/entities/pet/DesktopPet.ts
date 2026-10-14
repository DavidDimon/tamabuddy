export const DESKTOP_PET_STAGES = [
  'egg',
  'baby',
  'child',
  'teen',
  'adult',
  'elder',
] as const;

export type DesktopPetStage = (typeof DESKTOP_PET_STAGES)[number];
export type DesktopPetBehavior = 'egg' | 'idle' | 'sleeping' | 'dead';

export type DesktopPetAction =
  | 'feedMeal'
  | 'feedSnack'
  | 'play'
  | 'clean'
  | 'giveMedicine'
  | 'discipline'
  | 'turnLightsOff';

export interface DesktopPet {
  readonly behavior: DesktopPetBehavior;
  readonly createdAt: number;
  readonly happiness: number;
  readonly health: number;
  readonly hunger: number;
  readonly isIll: boolean;
  readonly lastProcessedAt: number;
  readonly needsAttention: boolean;
  readonly poopCount: number;
  readonly stage: DesktopPetStage;
}
