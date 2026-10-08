import {
  type Clock,
  InMemoryTamabuddyRepository,
  Tamabuddy,
  TamabuddyId,
} from '@tamabuddy/tamabuddy-engine';

import { createTamabuddyClient } from '../TamabuddyClient.js';

const clockAt = (timestamp: number): Clock => ({ now: () => timestamp });

describe('TamabuddyClient', () => {
  it('creates a pet only when the repository is empty', async () => {
    const client = createTamabuddyClient({
      repository: new InMemoryTamabuddyRepository(),
      clock: clockAt(100),
    });

    expect(client.getSnapshot().status).toBe('loading');
    await client.refresh();

    expect(client.getSnapshot()).toMatchObject({
      status: 'ready',
      source: 'created',
      state: { id: 'primary-pet', createdAt: 100 },
    });
  });

  it('restores an existing pet without replacing its creation time', async () => {
    const repository = new InMemoryTamabuddyRepository();
    await repository.save(
      Tamabuddy.create(TamabuddyId.create('primary-pet'), 42),
    );
    const client = createTamabuddyClient({
      repository,
      clock: clockAt(42),
    });

    await client.refresh();

    expect(client.getSnapshot()).toMatchObject({
      status: 'ready',
      source: 'restored',
      state: { createdAt: 42 },
    });
  });

  it('serializes commands behind initialization', async () => {
    const client = createTamabuddyClient({
      repository: new InMemoryTamabuddyRepository(),
      clock: clockAt(0),
    });

    await expect(client.dispatch({ type: 'clean' })).resolves.toMatchObject({
      accepted: false,
      rejection: 'invalid-behavior',
    });
  });

  it('publishes the baby snapshot after quick hatch', async () => {
    const client = createTamabuddyClient({
      repository: new InMemoryTamabuddyRepository(),
      clock: clockAt(100),
    });

    await expect(client.hatchNow()).resolves.toMatchObject({
      hatched: true,
      state: { stage: 'baby', hatchedAt: 100 },
    });
    expect(client.getSnapshot().state.stage).toBe('baby');
  });

  it('resets the primary pet to a new egg at the current time', async () => {
    let now = 42;
    const repository = new InMemoryTamabuddyRepository();
    await repository.save(
      Tamabuddy.create(TamabuddyId.create('primary-pet'), 10),
    );
    const client = createTamabuddyClient({
      repository,
      clock: { now: () => now },
    });
    await client.refresh();
    now = 100;

    await expect(client.reset()).resolves.toMatchObject({
      stage: 'egg',
      behavior: 'egg',
      createdAt: 100,
      lastProcessedAt: 100,
    });
    expect(client.getSnapshot()).toMatchObject({
      status: 'ready',
      source: 'created',
      state: { createdAt: 100 },
    });
  });

  it('publishes failures without silently creating a replacement pet', async () => {
    const failure = new Error('invalid save');
    const client = createTamabuddyClient({
      repository: {
        findById: () => Promise.reject(failure),
        save: () => Promise.resolve(),
      },
      clock: clockAt(100),
    });

    await client.refresh().catch(() => undefined);

    expect(client.getSnapshot()).toMatchObject({
      status: 'error',
      source: null,
      error: failure,
    });
  });
});
