import { Tamagotchi } from '../../../domain/entities/Tamagotchi.js';
import {
  emptyStageStats,
  Stage,
  TamagotchiSchedules,
  TamagotchiState,
} from '../../../domain/models/TamagotchiState.js';
import { careStageRules } from '../../../domain/rules/stageRules.js';
import { TamagotchiId } from '../../../domain/value-objects/TamagotchiId.js';

type StateOverrides = Partial<Omit<TamagotchiState, 'schedules'>> & {
  readonly schedules?: Partial<TamagotchiSchedules>;
};

export class TamagotchiBuilder {
  private state: TamagotchiState;

  private constructor(stage: Exclude<Stage, 'egg'>, at: number) {
    const rules = careStageRules(stage);
    this.state = {
      ...Tamagotchi.create(TamagotchiId.create('pet-1'), at).snapshot(),
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
  ): TamagotchiBuilder {
    return new TamagotchiBuilder(stage, at);
  }

  with(overrides: StateOverrides): TamagotchiBuilder {
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

  build(): Tamagotchi {
    return Tamagotchi.restore(this.state);
  }
}
