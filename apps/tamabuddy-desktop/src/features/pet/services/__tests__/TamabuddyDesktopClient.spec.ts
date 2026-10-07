import {
  type Clock,
  InMemoryTamabuddyRepository,
  Tamabuddy,
  TamabuddyId,
} from '@tamabuddy/tamabuddy-engine';

import { TamabuddyDesktopClient } from '../TamabuddyDesktopClient.js';

const clockAt = (timestamp: number): Clock => ({ now: () => timestamp });

describe('TamabuddyDesktopClient', () => {
  it('creates a primary pet when no save exists', async () => {
    const client = new TamabuddyDesktopClient(
      new InMemoryTamabuddyRepository(),
      clockAt(100),
    );

    await client.refresh();

    expect(client.getSnapshot()).toMatchObject({
      status: 'ready',
      state: { id: 'primary-pet', createdAt: 100 },
    });
  });

  it('loads an existing pet without overwriting its creation time', async () => {
    const repository = new InMemoryTamabuddyRepository();
    await repository.save(
      Tamabuddy.create(TamabuddyId.create('primary-pet'), 42),
    );
    const client = new TamabuddyDesktopClient(repository, clockAt(42));

    await client.refresh();

    expect(client.getSnapshot()).toMatchObject({
      status: 'ready',
      message: 'Pingo voltou para o seu cantinho.',
      state: { createdAt: 42 },
    });
  });

  it('keeps an invalid save blocked instead of silently replacing it', async () => {
    const repository = {
      findById: () => Promise.reject(new Error('invalid save')),
      save: () => Promise.resolve(),
    };
    const client = new TamabuddyDesktopClient(repository, clockAt(100));

    await client.refresh().catch(() => undefined);

    expect(client.getSnapshot()).toMatchObject({
      status: 'error',
      message: 'Não foi possível carregar o save local.',
    });
  });
});
