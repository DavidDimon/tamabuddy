export { LoadTamagotchi } from '../application/services/LoadTamagotchi.js';
export type { Clock } from '../application/ports/Clock.js';
export type { TamagotchiRepository } from '../application/ports/TamagotchiRepository.js';
export { Tamagotchi } from '../domain/entities/Tamagotchi.js';
export { TamagotchiId } from '../domain/value-objects/TamagotchiId.js';
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
  TamagotchiState,
} from '../domain/models/TamagotchiState.js';
export type {
  ActionRejection,
  TamagotchiCommand,
} from '../domain/rules/actions.js';
export {
  TamagotchiEngine,
  type EngineCommandResult,
} from '../engine/TamagotchiEngine.js';
export {
  ElapsedTimeProcessor,
  type ElapsedTimeWindow,
} from '../engine/processors/ElapsedTimeProcessor.js';
export { SystemClock } from '../infrastructure/clock/SystemClock.js';
export { InMemoryTamagotchiRepository } from '../infrastructure/persistence/InMemoryTamagotchiRepository.js';
