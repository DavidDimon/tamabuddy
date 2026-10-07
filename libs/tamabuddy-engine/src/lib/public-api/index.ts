export { LoadTamabuddy } from '../application/services/LoadTamabuddy.js';
export type { Clock } from '../application/ports/Clock.js';
export type { TamabuddyRepository } from '../application/ports/TamabuddyRepository.js';
export { Tamabuddy } from '../domain/entities/Tamabuddy.js';
export { TamabuddyId } from '../domain/value-objects/TamabuddyId.js';
export type {
  AttentionCall,
  AttentionReason,
  Behavior,
  CareProfile,
  EvolutionEntry,
  Illness,
  IllnessCause,
  Stage,
  StageStats,
  TamabuddyState,
} from '../domain/models/TamabuddyState.js';
export type {
  ActionRejection,
  TamabuddyCommand,
} from '../domain/rules/actions.js';
export {
  TamabuddyEngine,
  type EngineCommandResult,
} from '../engine/TamabuddyEngine.js';
export {
  ElapsedTimeProcessor,
  type ElapsedTimeWindow,
} from '../engine/processors/ElapsedTimeProcessor.js';
export { SystemClock } from '../infrastructure/clock/SystemClock.js';
export { InMemoryTamabuddyRepository } from '../infrastructure/persistence/InMemoryTamabuddyRepository.js';
export {
  LocalStorageTamabuddyRepository,
  TamabuddyPersistenceError,
  type StringStorage,
  type TamabuddyPersistenceErrorCode,
} from '../infrastructure/persistence/LocalStorageTamabuddyRepository.js';
