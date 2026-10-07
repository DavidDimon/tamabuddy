import {
  createTamabuddyClient,
  type TamabuddyClient,
} from '@tamabuddy/tamabuddy-client';
import {
  type Clock,
  InMemoryTamabuddyRepository,
  SystemClock,
  type TamabuddyRepository,
} from '@tamabuddy/tamabuddy-engine';

export type TamabuddyEngineClient = TamabuddyClient;

export function createTamabuddyEngineClient(
  clock: Clock = new SystemClock(),
  repository: TamabuddyRepository = new InMemoryTamabuddyRepository(),
): TamabuddyEngineClient {
  return createTamabuddyClient({ clock, repository });
}

export const tamabuddyEngineClient = createTamabuddyEngineClient();
