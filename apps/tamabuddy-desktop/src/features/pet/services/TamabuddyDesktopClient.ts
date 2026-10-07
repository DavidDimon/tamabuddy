import {
  createTamabuddyClient,
  type TamabuddyClient,
  type TamabuddyClientSnapshot,
  type TamabuddyClientStatus,
} from '@tamabuddy/tamabuddy-client';
import {
  type Clock,
  type EngineCommandResult,
  LocalStorageTamabuddyRepository,
  SystemClock,
  type TamabuddyCommand,
  type TamabuddyRepository,
  type TamabuddyState,
} from '@tamabuddy/tamabuddy-engine';

export type DesktopClientStatus = TamabuddyClientStatus;

export interface DesktopClientSnapshot {
  readonly state: TamabuddyState;
  readonly message: string;
  readonly status: DesktopClientStatus;
}

export class TamabuddyDesktopClient {
  private readonly client: TamabuddyClient;
  private readonly listeners = new Set<() => void>();
  private snapshot: DesktopClientSnapshot;

  constructor(
    repository: TamabuddyRepository,
    clock: Clock = new SystemClock(),
  ) {
    this.client = createTamabuddyClient({ repository, clock });
    this.snapshot = {
      state: this.client.getSnapshot().state,
      message: 'Pingo está chegando...',
      status: 'loading',
    };
    this.client.subscribe(this.syncFromClient);
  }

  readonly getSnapshot = (): DesktopClientSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly refresh = (): Promise<void> => this.client.refresh();

  readonly dispatch = async (
    command: TamabuddyCommand,
  ): Promise<EngineCommandResult> => {
    try {
      const result = await this.client.dispatch(command);
      this.update({
        state: result.state,
        message: result.accepted
          ? acceptedMessage(command)
          : rejectionMessage(result.rejection),
        status: 'ready',
      });
      return result;
    } catch (error) {
      this.syncFromClient();
      throw error;
    }
  };

  private readonly syncFromClient = (): void => {
    const clientSnapshot = this.client.getSnapshot();
    this.update({
      state: clientSnapshot.state,
      status: clientSnapshot.status,
      message: statusMessage(clientSnapshot, this.snapshot),
    });
  };

  private update(snapshot: DesktopClientSnapshot): void {
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
}

function statusMessage(
  client: TamabuddyClientSnapshot,
  current: DesktopClientSnapshot,
): string {
  if (client.status === 'error') {
    return 'Não foi possível carregar o save local.';
  }
  if (current.status === 'loading' && client.source === 'restored') {
    return 'Pingo voltou para o seu cantinho.';
  }
  return current.message;
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
