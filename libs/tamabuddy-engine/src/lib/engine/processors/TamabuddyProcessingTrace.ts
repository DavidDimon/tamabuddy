import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyState } from '../../domain/models/TamabuddyState.js';

export interface TamabuddyProcessingTraceEntry {
  readonly at: number;
  readonly before: TamabuddyState;
  readonly after: TamabuddyState;
}

export interface TamabuddyProcessingResult {
  readonly tamabuddy: Tamabuddy;
  readonly trace: readonly TamabuddyProcessingTraceEntry[];
}
