import { FakeClock } from '../../application/ports/__mocks__/FakeClock.mock.js';
import { MINUTE } from '../../domain/rules/stageRules.js';
import { TamagotchiId } from '../../domain/value-objects/TamagotchiId.js';
import { InMemoryTamagotchiRepository } from '../../infrastructure/persistence/InMemoryTamagotchiRepository.js';
import { TamagotchiEngine } from '../TamagotchiEngine.js';

describe('TamagotchiEngine', () => {
  it('creates, loads with offline elapsed time, commands, and saves', async () => {
    const clock = new FakeClock(0);
    const repository = new InMemoryTamagotchiRepository();
    const engine = new TamagotchiEngine(clock, repository);
    const id = TamagotchiId.create('pet-1');

    await expect(engine.create(id)).resolves.toMatchObject({
      stage: 'egg',
      behavior: 'egg',
    });

    clock.set(35 * MINUTE);
    await expect(engine.load(id)).resolves.toMatchObject({
      stage: 'baby',
      hunger: 3,
    });

    await expect(
      engine.command(id, { type: 'feedMeal' }),
    ).resolves.toMatchObject({
      accepted: true,
      state: { hunger: 4, weight: 6 },
    });
    await expect(repository.findById(id)).resolves.toMatchObject({
      id: { value: 'pet-1' },
    });
  });

  it('returns null for commands against an unknown id', async () => {
    const engine = new TamagotchiEngine(
      new FakeClock(0),
      new InMemoryTamagotchiRepository(),
    );

    await expect(
      engine.command(TamagotchiId.create('missing'), { type: 'clean' }),
    ).resolves.toBeNull();
  });
});
