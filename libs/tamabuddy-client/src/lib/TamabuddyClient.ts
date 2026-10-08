import {
  type Clock,
  type EngineCommandResult,
  type EngineHatchResult,
  SystemClock,
  Tamabuddy,
  type TamabuddyCommand,
  TamabuddyEngine,
  TamabuddyId,
  type TamabuddyRepository,
  type TamabuddyState,
} from '@tamabuddy/tamabuddy-engine';

export type TamabuddyClientStatus = 'loading' | 'ready' | 'error';
export type TamabuddyClientSource = 'created' | 'restored' | null;

export interface TamabuddyClientSnapshot {
  readonly state: TamabuddyState;
  readonly status: TamabuddyClientStatus;
  readonly source: TamabuddyClientSource;
  readonly error: unknown | null;
}

export interface CreateTamabuddyClientOptions {
  readonly repository: TamabuddyRepository;
  readonly clock?: Clock;
  readonly id?: string;
}

export class TamabuddyClient {
  private readonly id: TamabuddyId;
  private readonly engine: TamabuddyEngine;
  private readonly listeners = new Set<() => void>();
  private snapshot: TamabuddyClientSnapshot;
  private queue: Promise<void>;

  constructor({
    repository,
    clock = new SystemClock(),
    id = 'primary-pet',
  }: CreateTamabuddyClientOptions) {
    this.id = TamabuddyId.create(id);
    this.engine = new TamabuddyEngine(clock, repository);
    this.snapshot = {
      state: Tamabuddy.create(this.id, clock.now()).snapshot(),
      status: 'loading',
      source: null,
      error: null,
    };
    this.queue = this.initialize(repository);
  }

  readonly getSnapshot = (): TamabuddyClientSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly refresh = (): Promise<void> =>
    this.run(async () => {
      const state = await this.engine.load(this.id);
      if (state === null) throw new Error('Tamabuddy is unavailable');
      this.update({
        state,
        status: 'ready',
        source: this.snapshot.source ?? 'restored',
        error: null,
      });
    });

  readonly hatchNow = (): Promise<EngineHatchResult> =>
    this.run(async () => {
      const result = await this.engine.hatchNow(this.id);
      if (result === null) throw new Error('Tamabuddy is unavailable');
      this.update({
        state: result.state,
        status: 'ready',
        source: this.snapshot.source,
        error: null,
      });
      return result;
    });

  readonly dispatch = (
    command: TamabuddyCommand,
  ): Promise<EngineCommandResult> =>
    this.run(async () => {
      const result = await this.engine.command(this.id, command);
      if (result === null) throw new Error('Tamabuddy is unavailable');
      this.update({
        state: result.state,
        status: 'ready',
        source: this.snapshot.source,
        error: null,
      });
      return result;
    });

  readonly reset = (): Promise<TamabuddyState> =>
    this.run(async () => {
      const state = await this.engine.create(this.id);
      this.update({
        state,
        status: 'ready',
        source: 'created',
        error: null,
      });
      return state;
    });

  readonly stop = (): void => this.listeners.clear();

  private async initialize(repository: TamabuddyRepository): Promise<void> {
    try {
      const stored = await repository.findById(this.id);
      const state =
        stored === null
          ? await this.engine.create(this.id)
          : await this.engine.load(this.id);
      if (state === null) throw new Error('Tamabuddy is unavailable');
      this.update({
        state,
        status: 'ready',
        source: stored === null ? 'created' : 'restored',
        error: null,
      });
    } catch (error) {
      this.fail(error);
    }
  }

  private run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation).catch((error: unknown) => {
      this.fail(error);
      throw error;
    });
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private fail(error: unknown): void {
    this.update({ ...this.snapshot, status: 'error', error });
  }

  private update(snapshot: TamabuddyClientSnapshot): void {
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
}

export function createTamabuddyClient(
  options: CreateTamabuddyClientOptions,
): TamabuddyClient {
  return new TamabuddyClient(options);
}
