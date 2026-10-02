import { Tamagotchi } from '../../../domain/entities/Tamagotchi.js';
import { TamagotchiId } from '../../../domain/value-objects/TamagotchiId.js';
import { InMemoryTamagotchiRepository } from '../InMemoryTamagotchiRepository.js';

describe('InMemoryTamagotchiRepository', () => {
  it('persists and retrieves a tamagotchi through the repository contract', async () => {
    const repository = new InMemoryTamagotchiRepository();
    const id = TamagotchiId.create('pet-1');
    const tamagotchi = Tamagotchi.create(id);

    await repository.save(tamagotchi);

    const restored = await repository.findById(id);
    expect(restored).not.toBe(tamagotchi);
    expect(restored?.snapshot()).toEqual(tamagotchi.snapshot());
  });

  it('returns null for an unknown identifier', async () => {
    const repository = new InMemoryTamagotchiRepository();

    await expect(
      repository.findById(TamagotchiId.create('missing')),
    ).resolves.toBeNull();
  });
});
