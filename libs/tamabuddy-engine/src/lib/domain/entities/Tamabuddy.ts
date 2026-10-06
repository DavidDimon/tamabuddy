import { TamabuddyId } from '../value-objects/TamabuddyId.js';
import {
  cloneTamabuddyState,
  emptySchedules,
  emptyStageStats,
  TAMABUDDY_SCHEMA_VERSION,
  TamabuddyState,
} from '../models/TamabuddyState.js';

export class Tamabuddy {
  private constructor(private readonly persistedState: TamabuddyState) {}

  static create(id: TamabuddyId, createdAt = 0): Tamabuddy {
    assertTimestamp(createdAt, 'createdAt');

    return new Tamabuddy({
      schemaVersion: TAMABUDDY_SCHEMA_VERSION,
      id: id.value,
      stage: 'egg',
      behavior: 'egg',
      createdAt,
      hatchedAt: null,
      stageStartedAt: createdAt,
      lastProcessedAt: createdAt,
      hunger: 0,
      happiness: 0,
      discipline: 0,
      health: 4,
      weight: 0,
      poopCount: 0,
      careMistakes: 0,
      stageStats: emptyStageStats(),
      evolutionHistory: [],
      consecutiveSnacks: 0,
      illness: null,
      attention: null,
      attentionCooldowns: {},
      schedules: emptySchedules(),
      lightsOn: true,
    });
  }

  static restore(state: TamabuddyState): Tamabuddy {
    validateState(state);
    return new Tamabuddy(cloneTamabuddyState(state));
  }

  get id(): TamabuddyId {
    return TamabuddyId.create(this.persistedState.id);
  }

  snapshot(): TamabuddyState {
    return cloneTamabuddyState(this.persistedState);
  }
}

function validateState(state: TamabuddyState): void {
  if (state.schemaVersion !== TAMABUDDY_SCHEMA_VERSION) {
    throw new RangeError(
      `Unsupported Tamabuddy schema: ${state.schemaVersion}`,
    );
  }

  TamabuddyId.create(state.id);
  assertTimestamp(state.createdAt, 'createdAt');
  assertTimestamp(state.stageStartedAt, 'stageStartedAt');
  assertTimestamp(state.lastProcessedAt, 'lastProcessedAt');

  if (
    state.createdAt > state.stageStartedAt ||
    state.stageStartedAt > state.lastProcessedAt
  ) {
    throw new RangeError('Tamabuddy timestamps must be chronological');
  }

  assertIntegerRange(state.hunger, 0, 4, 'hunger');
  assertIntegerRange(state.happiness, 0, 4, 'happiness');
  assertIntegerRange(state.discipline, 0, 4, 'discipline');
  assertIntegerRange(state.health, 0, 4, 'health');
  assertIntegerRange(state.poopCount, 0, 3, 'poopCount');
  assertIntegerRange(state.weight, 0, 99, 'weight');
  assertNonNegativeInteger(state.careMistakes, 'careMistakes');
  assertIntegerRange(state.consecutiveSnacks, 0, 2, 'consecutiveSnacks');
  validateStageStats(state);

  if (state.stage === 'egg' && state.weight !== 0) {
    throw new RangeError('Egg weight must be 0');
  }
  if (state.stage !== 'egg' && state.weight < 1) {
    throw new RangeError('Hatched weight must be from 1 to 99');
  }

  if (
    (state.stage === 'egg') !==
    (state.behavior === 'egg' && state.hatchedAt === null)
  ) {
    throw new RangeError('Egg stage, behavior, and hatch time must agree');
  }

  if (state.stage !== 'egg' && state.hatchedAt === null) {
    throw new RangeError('A hatched Tamabuddy requires hatchedAt');
  }
  if (state.stage !== 'egg' && state.behavior === 'egg') {
    throw new RangeError('Only the egg stage may use egg behavior');
  }
  if (state.hatchedAt !== null) {
    assertTimestamp(state.hatchedAt, 'hatchedAt');
    if (
      state.hatchedAt < state.createdAt ||
      state.hatchedAt > state.stageStartedAt
    ) {
      throw new RangeError('Hatch time must be chronological');
    }
  }

  if (state.behavior === 'sleeping') {
    if (
      state.schedules.wakeAt === null ||
      state.schedules.wakeAt <= state.lastProcessedAt ||
      state.lightsOn
    ) {
      throw new RangeError(
        'Sleeping requires a future wake time and lights off',
      );
    }
  } else if (state.schedules.wakeAt !== null) {
    throw new RangeError('Only sleeping behavior may have a wake time');
  }

  if (state.health === 0 && state.behavior !== 'dead') {
    throw new RangeError('Health zero requires dead behavior');
  }

  if (
    state.illness !== null &&
    state.illness.medicineDoses !== 0 &&
    state.illness.medicineDoses !== 1
  ) {
    throw new RangeError('Illness medicine doses must be 0 or 1');
  }
  if (state.illness !== null) {
    assertTimestamp(state.illness.startedAt, 'illness.startedAt');
    assertTimestamp(state.illness.nextDamageAt, 'illness.nextDamageAt');
    if (
      state.illness.startedAt > state.lastProcessedAt ||
      state.illness.nextDamageAt <= state.lastProcessedAt
    ) {
      throw new RangeError('Illness timestamps must surround lastProcessedAt');
    }
  }

  if (
    state.attention !== null &&
    state.attention.expiresAt <= state.attention.openedAt
  ) {
    throw new RangeError('Attention expiry must follow its open time');
  }
  if (
    state.attention !== null &&
    (state.attention.openedAt > state.lastProcessedAt ||
      state.attention.expiresAt <= state.lastProcessedAt)
  ) {
    throw new RangeError('Active attention must surround lastProcessedAt');
  }

  for (const timestamp of Object.values(state.attentionCooldowns)) {
    assertFutureTimestamp(
      timestamp,
      state.lastProcessedAt,
      'attention cooldown',
    );
  }
  for (const timestamp of Object.values(state.schedules)) {
    if (timestamp !== null && timestamp < state.lastProcessedAt) {
      throw new RangeError('Schedules cannot precede lastProcessedAt');
    }
  }

  let previousEvolutionAt = Number.NEGATIVE_INFINITY;
  for (const evolution of state.evolutionHistory) {
    if (previousEvolutionAt > evolution.at) {
      throw new RangeError('Evolution history must be chronological');
    }
    assertIntegerRange(evolution.score, 0, 10, 'evolution score');
    if (evolution.at > state.lastProcessedAt) {
      throw new RangeError('Evolution cannot occur in the future');
    }
    previousEvolutionAt = evolution.at;
  }
}

function validateStageStats(state: TamabuddyState): void {
  const stats = state.stageStats;
  assertNonNegativeInteger(stats.careMistakes, 'stage careMistakes');
  assertNonNegativeInteger(stats.meals, 'stage meals');
  assertNonNegativeInteger(stats.snacks, 'stage snacks');
  assertNonNegativeInteger(stats.gamesPlayed, 'stage gamesPlayed');
  assertNonNegativeInteger(stats.gamesWon, 'stage gamesWon');
  assertNonNegativeInteger(stats.sicknessEpisodes, 'stage sicknessEpisodes');
  if (stats.gamesWon > stats.gamesPlayed) {
    throw new RangeError('Stage game wins cannot exceed games played');
  }
}

function assertFutureTimestamp(
  value: number,
  lastProcessedAt: number,
  name: string,
): void {
  assertTimestamp(value, name);
  if (value <= lastProcessedAt) {
    throw new RangeError(`${name} must follow lastProcessedAt`);
  }
}

function assertTimestamp(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer timestamp`);
  }
}

function assertIntegerRange(
  value: number,
  minimum: number,
  maximum: number,
  name: string,
): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(
      `${name} must be an integer from ${minimum} to ${maximum}`,
    );
  }
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}
