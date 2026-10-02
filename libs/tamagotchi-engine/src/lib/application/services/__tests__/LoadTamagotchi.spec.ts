import { Tamagotchi } from '../../../domain/entities/Tamagotchi.js';
import { TamagotchiId } from '../../../domain/value-objects/TamagotchiId.js';
import { LoadTamagotchi } from '../LoadTamagotchi.js';
import { TamagotchiRepositoryMock } from '../__mocks__/TamagotchiRepository.mock.js';

describe('LoadTamagotchi', () => {
  it('loads a tamagotchi through the repository port', async () => {
    const id = TamagotchiId.create('pet-1');
    const tamagotchi = Tamagotchi.create(id);
    const repository = new TamagotchiRepositoryMock(tamagotchi);

    await expect(new LoadTamagotchi(repository).execute(id)).resolves.toBe(
      tamagotchi,
    );
    expect(repository.requestedId).toBe(id);
  });
});
