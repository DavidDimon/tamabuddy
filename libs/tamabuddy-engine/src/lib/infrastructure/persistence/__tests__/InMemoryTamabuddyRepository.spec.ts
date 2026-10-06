import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';
import { InMemoryTamabuddyRepository } from '../InMemoryTamabuddyRepository.js';

describe('InMemoryTamabuddyRepository', () => {
  it('persists and retrieves a tamabuddy through the repository contract', async () => {
    const repository = new InMemoryTamabuddyRepository();
    const id = TamabuddyId.create('pet-1');
    const tamabuddy = Tamabuddy.create(id);

    await repository.save(tamabuddy);

    const restored = await repository.findById(id);
    expect(restored).not.toBe(tamabuddy);
    expect(restored?.snapshot()).toEqual(tamabuddy.snapshot());
  });

  it('returns null for an unknown identifier', async () => {
    const repository = new InMemoryTamabuddyRepository();

    await expect(
      repository.findById(TamabuddyId.create('missing')),
    ).resolves.toBeNull();
  });
});
