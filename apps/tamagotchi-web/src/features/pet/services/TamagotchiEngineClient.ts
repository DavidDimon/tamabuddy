import {
  type Clock,
  type EngineCommandResult,
  InMemoryTamagotchiRepository,
  SystemClock,
  Tamagotchi,
  type TamagotchiCommand,
  TamagotchiEngine,
  TamagotchiId,
  type TamagotchiRepository,
  type TamagotchiState,
} from '@tamabuddy/tamagotchi-engine';

export interface TamagotchiEngineClient {
  readonly getSnapshot: () => TamagotchiState;
  readonly subscribe: (listener: () => void) => () => void;
  readonly dispatch: (
    command: TamagotchiCommand,
  ) => Promise<EngineCommandResult>;
  readonly stop: () => void;
}

export function createTamagotchiEngineClient(
  clock: Clock = new SystemClock(),
  repository: TamagotchiRepository = new InMemoryTamagotchiRepository(),
): TamagotchiEngineClient {
  const id = TamagotchiId.create('primary-pet');
  const initial = Tamagotchi.create(id, clock.now());
  const engine = new TamagotchiEngine(clock, repository);
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
        throw new Error('Primary Tamagotchi is unavailable');
      }
      snapshot = result.state;
      for (const listener of listeners) listener();
      return result;
    },
    stop: () => listeners.clear(),
  };
}

export const tamagotchiEngineClient = createTamagotchiEngineClient();
