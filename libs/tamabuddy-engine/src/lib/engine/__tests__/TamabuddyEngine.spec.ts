import { FakeClock } from '../../application/ports/__mocks__/FakeClock.mock.js';
import { MINUTE } from '../../domain/rules/stageRules.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';
import { InMemoryTamabuddyRepository } from '../../infrastructure/persistence/InMemoryTamabuddyRepository.js';
import { TamabuddyEngine } from '../TamabuddyEngine.js';

describe('TamabuddyEngine', () => {
  it('creates, loads with offline elapsed time, commands, and saves', async () => {
    const clock = new FakeClock(0);
    const repository = new InMemoryTamabuddyRepository();
    const engine = new TamabuddyEngine(clock, repository);
    const id = TamabuddyId.create('pet-1');

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
    const engine = new TamabuddyEngine(
      new FakeClock(0),
      new InMemoryTamabuddyRepository(),
    );

    await expect(
      engine.command(TamabuddyId.create('missing'), { type: 'clean' }),
    ).resolves.toBeNull();
  });
});
