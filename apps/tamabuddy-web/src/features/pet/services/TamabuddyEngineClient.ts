import {
  type Clock,
  type EngineCommandResult,
  InMemoryTamabuddyRepository,
  SystemClock,
  Tamabuddy,
  type TamabuddyCommand,
  TamabuddyEngine,
  TamabuddyId,
  type TamabuddyRepository,
  type TamabuddyState,
} from '@tamabuddy/tamabuddy-engine';

export interface TamabuddyEngineClient {
  readonly getSnapshot: () => TamabuddyState;
  readonly subscribe: (listener: () => void) => () => void;
  readonly dispatch: (
    command: TamabuddyCommand,
  ) => Promise<EngineCommandResult>;
  readonly stop: () => void;
}

export function createTamabuddyEngineClient(
  clock: Clock = new SystemClock(),
  repository: TamabuddyRepository = new InMemoryTamabuddyRepository(),
): TamabuddyEngineClient {
  const id = TamabuddyId.create('primary-pet');
  const initial = Tamabuddy.create(id, clock.now());
  const engine = new TamabuddyEngine(clock, repository);
  const listeners = new Set<() => void>();
  let snapshot = initial.snapshot();
  const ready = repository.save(initial);

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispatch: async (command) => {
      await ready;
      const result = await engine.command(id, command);
      if (result === null) {
        throw new Error('Primary Tamabuddy is unavailable');
      }
      snapshot = result.state;
      for (const listener of listeners) listener();
      return result;
    },
    stop: () => listeners.clear(),
  };
}

export const tamabuddyEngineClient = createTamabuddyEngineClient();
