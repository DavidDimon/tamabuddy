import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { TamabuddyState } from '../../../domain/models/TamabuddyState.js';
import { LifeTimelineEntry } from '../LifeTimeline.js';
import { NormalizedRandomOwnerConfiguration } from '../strategies/randomOwner.js';

export interface SimulationInvariantEntryContext {
  readonly seed: number;
  readonly configuration: NormalizedRandomOwnerConfiguration;
  readonly entry: LifeTimelineEntry;
  readonly state: TamabuddyState;
}

export interface SimulationInvariantFinalContext {
  readonly seed: number;
  readonly configuration: NormalizedRandomOwnerConfiguration;
  readonly state: TamabuddyState;
}

export interface SimulationInvariant {
  readonly name: string;
  checkEntry?(context: SimulationInvariantEntryContext): string | void;
  checkFinal?(context: SimulationInvariantFinalContext): string | void;
}

export const structuralStateInvariant: SimulationInvariant = {
  name: 'structural-state',
  checkEntry: ({ state }) => structuralViolation(state),
  checkFinal: ({ state }) => structuralViolation(state),
};

function structuralViolation(state: TamabuddyState): string | void {
  try {
    Tamabuddy.restore(state);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
