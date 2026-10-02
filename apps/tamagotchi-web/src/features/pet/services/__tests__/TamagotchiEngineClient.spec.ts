import { createTamagotchiEngineClient } from '../TamagotchiEngineClient.js';

describe('TamagotchiEngineClient', () => {
  it('exposes the engine snapshot through the public API boundary', () => {
    const client = createTamagotchiEngineClient({ now: () => 0 });

    expect(client.getSnapshot().behavior).toBe('egg');

    client.stop();
  });

  it('dispatches domain commands without exposing machine events', async () => {
    const client = createTamagotchiEngineClient({ now: () => 0 });

    await expect(client.dispatch({ type: 'clean' })).resolves.toMatchObject({
      accepted: false,
      rejection: 'invalid-behavior',
    });
  });
});
