import { createTamabuddyEngineClient } from '../TamabuddyEngineClient.js';

describe('TamabuddyEngineClient', () => {
  it('exposes the engine snapshot through the public API boundary', () => {
    const client = createTamabuddyEngineClient({ now: () => 0 });

    expect(client.getSnapshot().behavior).toBe('egg');

    client.stop();
  });

  it('dispatches domain commands without exposing machine events', async () => {
    const client = createTamabuddyEngineClient({ now: () => 0 });

    await expect(client.dispatch({ type: 'clean' })).resolves.toMatchObject({
      accepted: false,
      rejection: 'invalid-behavior',
    });
  });
});
