export const TAMABUDDY_SCHEMA_VERSION = 1 as const;

export type Stage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder';
export type Behavior = 'egg' | 'idle' | 'sleeping' | 'dead';
export type IllnessCause = 'hygiene' | 'diet' | 'weakness' | 'overweight';
export type AttentionReason =
  'sickness' | 'poop' | 'hunger' | 'happiness' | 'sleep' | 'discipline';
export type CareProfile = 'thriving' | 'balanced' | 'struggling';

export interface StageStats {
  readonly careMistakes: number;
  readonly meals: number;
  readonly snacks: number;
  readonly gamesPlayed: number;
  readonly gamesWon: number;
  readonly sicknessEpisodes: number;
}

export interface EvolutionEntry {
  readonly fromStage: Exclude<Stage, 'elder'>;
  readonly toStage: Exclude<Stage, 'egg'>;
  readonly at: number;
  readonly score: number;
  readonly profile: CareProfile;
}

export interface Illness {
  readonly cause: IllnessCause;
  readonly startedAt: number;
  readonly medicineDoses: 0 | 1;
  readonly nextDamageAt: number;
}

export interface AttentionCall {
  readonly reason: AttentionReason;
  readonly openedAt: number;
  readonly expiresAt: number;
}

export type AttentionCooldowns = Partial<
  Readonly<Record<AttentionReason, number>>
>;

export interface TamabuddySchedules {
  readonly nextHungerAt: number | null;
  readonly nextHappinessAt: number | null;
  readonly nextPoopAt: number | null;
  readonly nextDisciplineAt: number | null;
  readonly nextSleepAt: number | null;
  readonly wakeAt: number | null;
  readonly nextNeglectDamageAt: number | null;
}

export interface TamabuddyState {
  readonly schemaVersion: typeof TAMABUDDY_SCHEMA_VERSION;
  readonly id: string;
  readonly stage: Stage;
  readonly behavior: Behavior;
  readonly createdAt: number;
  readonly hatchedAt: number | null;
  readonly stageStartedAt: number;
  readonly lastProcessedAt: number;
  readonly hunger: number;
  readonly happiness: number;
  readonly discipline: number;
  readonly health: number;
  readonly weight: number;
  readonly poopCount: number;
  readonly careMistakes: number;
  readonly stageStats: StageStats;
  readonly evolutionHistory: readonly EvolutionEntry[];
  readonly consecutiveSnacks: number;
  readonly illness: Illness | null;
  readonly attention: AttentionCall | null;
  readonly attentionCooldowns: AttentionCooldowns;
  readonly schedules: TamabuddySchedules;
  readonly lightsOn: boolean;
}

export function emptyStageStats(): StageStats {
  return {
    careMistakes: 0,
    meals: 0,
    snacks: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    sicknessEpisodes: 0,
  };
}

export function emptySchedules(): TamabuddySchedules {
  return {
    nextHungerAt: null,
    nextHappinessAt: null,
    nextPoopAt: null,
    nextDisciplineAt: null,
    nextSleepAt: null,
    wakeAt: null,
    nextNeglectDamageAt: null,
  };
}

export function cloneTamabuddyState(state: TamabuddyState): TamabuddyState {
  return {
    ...state,
    stageStats: { ...state.stageStats },
    evolutionHistory: state.evolutionHistory.map((entry) => ({ ...entry })),
    illness: state.illness === null ? null : { ...state.illness },
    attention: state.attention === null ? null : { ...state.attention },
    attentionCooldowns: { ...state.attentionCooldowns },
    schedules: { ...state.schedules },
  };
}
