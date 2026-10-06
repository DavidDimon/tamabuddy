import { Stage } from '../models/TamabuddyState.js';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export type CareStage = Exclude<Stage, 'egg'>;
export type TimedStage = Exclude<Stage, 'elder'>;

export interface StageRules {
  readonly duration: number | null;
  readonly hungerRate: number | null;
  readonly happinessRate: number | null;
  readonly poopRate: number | null;
  readonly minimumWeight: number;
  readonly healthyMaxWeight: number;
  readonly awakeDuration: number | null;
  readonly sleepDuration: number | null;
  readonly disciplineStartsAfter: number | null;
}

export interface CareStageRules extends StageRules {
  readonly hungerRate: number;
  readonly happinessRate: number;
  readonly poopRate: number;
}

export const STAGE_RULES: Readonly<
  { egg: StageRules } & Record<CareStage, CareStageRules>
> = {
  egg: {
    duration: 5 * MINUTE,
    hungerRate: null,
    happinessRate: null,
    poopRate: null,
    minimumWeight: 0,
    healthyMaxWeight: 0,
    awakeDuration: null,
    sleepDuration: null,
    disciplineStartsAfter: null,
  },
  baby: {
    duration: HOUR,
    hungerRate: 30 * MINUTE,
    happinessRate: 30 * MINUTE,
    poopRate: HOUR,
    minimumWeight: 5,
    healthyMaxWeight: 12,
    awakeDuration: null,
    sleepDuration: null,
    disciplineStartsAfter: null,
  },
  child: {
    duration: DAY,
    hungerRate: HOUR,
    happinessRate: 90 * MINUTE,
    poopRate: 3 * HOUR,
    minimumWeight: 10,
    healthyMaxWeight: 20,
    awakeDuration: 16 * HOUR,
    sleepDuration: 8 * HOUR,
    disciplineStartsAfter: 30 * MINUTE,
  },
  teen: {
    duration: 2 * DAY,
    hungerRate: 75 * MINUTE,
    happinessRate: 2 * HOUR,
    poopRate: 4 * HOUR,
    minimumWeight: 15,
    healthyMaxWeight: 30,
    awakeDuration: 16 * HOUR,
    sleepDuration: 8 * HOUR,
    disciplineStartsAfter: 30 * MINUTE,
  },
  adult: {
    duration: 5 * DAY,
    hungerRate: 90 * MINUTE,
    happinessRate: 150 * MINUTE,
    poopRate: 5 * HOUR,
    minimumWeight: 20,
    healthyMaxWeight: 40,
    awakeDuration: 16 * HOUR,
    sleepDuration: 8 * HOUR,
    disciplineStartsAfter: null,
  },
  elder: {
    duration: null,
    hungerRate: 2 * HOUR,
    happinessRate: 3 * HOUR,
    poopRate: 6 * HOUR,
    minimumWeight: 20,
    healthyMaxWeight: 45,
    awakeDuration: 14 * HOUR,
    sleepDuration: 10 * HOUR,
    disciplineStartsAfter: null,
  },
};

export function careStageRules(stage: CareStage): CareStageRules {
  return STAGE_RULES[stage];
}

export function stageDuration(stage: TimedStage): number {
  const duration = STAGE_RULES[stage].duration;
  if (duration === null) {
    throw new RangeError(`Stage ${stage} requires a finite duration`);
  }
  return duration;
}

export function nextStage(stage: Stage): Stage | null {
  const stages: readonly Stage[] = [
    'egg',
    'baby',
    'child',
    'teen',
    'adult',
    'elder',
  ];
  const next = stages[stages.indexOf(stage) + 1];
  return next ?? null;
}
