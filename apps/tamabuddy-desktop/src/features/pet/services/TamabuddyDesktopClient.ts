import {
  type Clock,
  type EngineCommandResult,
  LocalStorageTamabuddyRepository,
  SystemClock,
  Tamabuddy,
  type TamabuddyCommand,
  TamabuddyEngine,
  TamabuddyId,
  type TamabuddyRepository,
  type TamabuddyState,
} from '@tamabuddy/tamabuddy-engine';

export type DesktopClientStatus = 'loading' | 'ready' | 'error';

export interface DesktopClientSnapshot {
  readonly state: TamabuddyState;
  readonly message: string;
  readonly status: DesktopClientStatus;
}

export class TamabuddyDesktopClient {
  private readonly id = TamabuddyId.create('primary-pet');
  private readonly engine: TamabuddyEngine;
  private readonly listeners = new Set<() => void>();
  private snapshot: DesktopClientSnapshot;
  private queue: Promise<void>;

  constructor(
    repository: TamabuddyRepository,
    clock: Clock = new SystemClock(),
  ) {
    const initial = Tamabuddy.create(this.id, clock.now());
    this.engine = new TamabuddyEngine(clock, repository);
    this.snapshot = {
      state: initial.snapshot(),
      message: 'Pingo está chegando...',
      status: 'loading',
    };
    this.queue = this.initialize(repository);
  }

  readonly getSnapshot = (): DesktopClientSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly refresh = async (): Promise<void> => {
    return this.run(async () => {
      const state = await this.engine.load(this.id);
      if (state === null) throw new Error('Primary Tamabuddy is unavailable');
      this.update({ state, message: this.snapshot.message, status: 'ready' });
    });
  };

  readonly dispatch = async (
    command: TamabuddyCommand,
  ): Promise<EngineCommandResult> => {
    return this.run(async () => {
      const result = await this.engine.command(this.id, command);
      if (result === null) throw new Error('Primary Tamabuddy is unavailable');
      this.update({
        state: result.state,
        message: result.accepted
          ? acceptedMessage(command)
          : rejectionMessage(result.rejection),
        status: 'ready',
      });
      return result;
    });
  };

  private async initialize(repository: TamabuddyRepository): Promise<void> {
    try {
      const stored = await repository.findById(this.id);
      const state =
        stored === null
          ? await this.engine.create(this.id)
          : await this.engine.load(this.id);
      if (state === null) throw new Error('Primary Tamabuddy is unavailable');

      this.update({
        state,
        message:
          stored === null
            ? 'Pingo está chegando...'
            : 'Pingo voltou para o seu cantinho.',
        status: 'ready',
      });
    } catch {
      this.update({
        ...this.snapshot,
        message: 'Não foi possível carregar o save local.',
        status: 'error',
      });
    }
  }

  private run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private update(snapshot: DesktopClientSnapshot): void {
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
}

function acceptedMessage(command: TamabuddyCommand): string {
  switch (command.type) {
    case 'feedMeal':
      return 'Pingo aproveitou a refeição.';
    case 'feedSnack':
      return 'Pingo gostou do lanche.';
    case 'play':
      return command.result === 'win'
        ? 'Pingo venceu a brincadeira!'
        : 'Foi divertido, mesmo sem vencer.';
    case 'clean':
      return 'Tudo limpo novamente.';
    case 'giveMedicine':
      return 'Pingo tomou o remédio.';
    case 'discipline':
      return 'Pingo entendeu o recado.';
    case 'turnLightsOff':
      return 'As luzes foram apagadas.';
  }
}

function rejectionMessage(rejection: EngineCommandResult['rejection']): string {
  switch (rejection) {
    case 'invalid-behavior':
      return 'Pingo não pode fazer isso agora.';
    case 'sick':
      return 'Pingo precisa melhorar primeiro.';
    case 'not-hungry':
      return 'Pingo não está com fome.';
    case 'not-unhappy':
      return 'Pingo já está muito feliz.';
    case 'minimum-weight':
      return 'Pingo precisa comer antes de brincar.';
    case 'nothing-to-clean':
      return 'Não há nada para limpar.';
    case 'not-sick':
      return 'Pingo não precisa de remédio.';
    case 'no-discipline-call':
      return 'Pingo não precisa de disciplina.';
    case 'no-sleep-call':
      return 'Ainda não é hora de apagar as luzes.';
    case 'requires-cleaning':
      return 'Limpe o ambiente antes do próximo remédio.';
    case undefined:
      return 'A ação não pôde ser concluída.';
  }
}

export const tamabuddyDesktopClient = new TamabuddyDesktopClient(
  new LocalStorageTamabuddyRepository(window.localStorage),
  new SystemClock(),
);
