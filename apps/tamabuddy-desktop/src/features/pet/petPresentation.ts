import type { DesktopPet, DesktopPetStage } from '../../entities/pet/index.js';

const STAGE_LABELS: Readonly<Record<DesktopPetStage, string>> = {
  egg: 'ovo',
  baby: 'bebê',
  child: 'criança',
  teen: 'jovem',
  adult: 'adulto',
  elder: 'ancião',
};

const DAY_MS = 24 * 60 * 60 * 1000;

type PetTimeline = Pick<DesktopPet, 'createdAt' | 'lastProcessedAt'>;

export function getPetDay({ createdAt, lastProcessedAt }: PetTimeline): number {
  return Math.floor((lastProcessedAt - createdAt) / DAY_MS) + 1;
}

export function getStageLabel(stage: DesktopPetStage): string {
  return STAGE_LABELS[stage];
}
