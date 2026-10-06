import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import {
  emptyStageStats,
  Stage,
  TamabuddySchedules,
  TamabuddyState,
} from '../../../domain/models/TamabuddyState.js';
import { careStageRules } from '../../../domain/rules/stageRules.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';

type StateOverrides = Partial<Omit<TamabuddyState, 'schedules'>> & {
  readonly schedules?: Partial<TamabuddySchedules>;
};

export class TamabuddyBuilder {
  private state: TamabuddyState;

  private constructor(stage: Exclude<Stage, 'egg'>, at: number) {
    const rules = careStageRules(stage);
    this.state = {
      ...Tamabuddy.create(TamabuddyId.create('pet-1'), at).snapshot(),
      stage,
      behavior: 'idle',
      hatchedAt: at,
      stageStartedAt: at,
      hunger: 4,
      happiness: 4,
      health: 4,
      weight: rules.minimumWeight,
      stageStats: emptyStageStats(),
      schedules: {
        nextHungerAt: at + rules.hungerRate,
        nextHappinessAt: at + rules.happinessRate,
        nextPoopAt: at + rules.poopRate,
        nextDisciplineAt:
          rules.disciplineStartsAfter === null
            ? null
            : at + rules.disciplineStartsAfter,
        nextSleepAt:
          rules.awakeDuration === null ? null : at + rules.awakeDuration,
        wakeAt: null,
        nextNeglectDamageAt: null,
      },
    };
  }

  static hatched(
    stage: Exclude<Stage, 'egg'> = 'baby',
    at = 0,
  ): TamabuddyBuilder {
    return new TamabuddyBuilder(stage, at);
  }

  with(overrides: StateOverrides): TamabuddyBuilder {
    this.state = {
      ...this.state,
      ...overrides,
      schedules: {
        ...this.state.schedules,
        ...overrides.schedules,
      },
    };
    return this;
  }

  build(): Tamabuddy {
    return Tamabuddy.restore(this.state);
  }
}
