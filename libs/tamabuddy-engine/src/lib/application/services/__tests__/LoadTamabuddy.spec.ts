import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';
import { LoadTamabuddy } from '../LoadTamabuddy.js';
import { TamabuddyRepositoryMock } from '../__mocks__/TamabuddyRepository.mock.js';

describe('LoadTamabuddy', () => {
  it('loads a tamabuddy through the repository port', async () => {
    const id = TamabuddyId.create('pet-1');
    const tamabuddy = Tamabuddy.create(id);
    const repository = new TamabuddyRepositoryMock(tamabuddy);

    await expect(new LoadTamabuddy(repository).execute(id)).resolves.toBe(
      tamabuddy,
    );
    expect(repository.requestedId).toBe(id);
  });
});
