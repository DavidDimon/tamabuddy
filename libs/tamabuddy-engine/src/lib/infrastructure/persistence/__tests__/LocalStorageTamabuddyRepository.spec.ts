import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';

import {
  LocalStorageTamabuddyRepository,
  TamabuddyPersistenceError,
  type StringStorage,
} from '../LocalStorageTamabuddyRepository.js';

class MemoryStringStorage implements StringStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('LocalStorageTamabuddyRepository', () => {
  it('round-trips a save without exposing mutable state', async () => {
    const storage = new MemoryStringStorage();
    const repository = new LocalStorageTamabuddyRepository(storage);
    const original = Tamabuddy.create(TamabuddyId.create('pingo'), 42);

    await repository.save(original);
    const restored = await repository.findById(TamabuddyId.create('pingo'));

    expect(restored?.snapshot()).toEqual(original.snapshot());
    expect(restored).not.toBe(original);
  });

  it('rejects malformed JSON without replacing the save', async () => {
    const storage = new MemoryStringStorage();
    storage.setItem('tamabuddy.save.v1.pingo', '{not-json');
    const repository = new LocalStorageTamabuddyRepository(storage);

    await expect(
      repository.findById(TamabuddyId.create('pingo')),
    ).rejects.toMatchObject({
      code: 'invalid-json',
    } satisfies Partial<TamabuddyPersistenceError>);
    expect(storage.getItem('tamabuddy.save.v1.pingo')).toBe('{not-json');
  });

  it('rejects unsupported save schemas through domain restoration', async () => {
    const storage = new MemoryStringStorage();
    const invalid = {
      ...Tamabuddy.create(TamabuddyId.create('pingo'), 42).snapshot(),
      schemaVersion: 999,
    };
    storage.setItem('tamabuddy.save.v1.pingo', JSON.stringify(invalid));
    const repository = new LocalStorageTamabuddyRepository(storage);

    await expect(
      repository.findById(TamabuddyId.create('pingo')),
    ).rejects.toMatchObject({
      code: 'invalid-state',
    } satisfies Partial<TamabuddyPersistenceError>);
  });

  it('reports storage read failures with a typed error', async () => {
    const repository = new LocalStorageTamabuddyRepository({
      getItem: () => {
        throw new Error('storage unavailable');
      },
      setItem: () => undefined,
    });

    await expect(
      repository.findById(TamabuddyId.create('pingo')),
    ).rejects.toMatchObject({
      code: 'read-failed',
    } satisfies Partial<TamabuddyPersistenceError>);
  });

  it('reports storage write failures with a typed error', async () => {
    const repository = new LocalStorageTamabuddyRepository({
      getItem: () => null,
      setItem: () => {
        throw new Error('storage full');
      },
    });

    await expect(
      repository.save(Tamabuddy.create(TamabuddyId.create('pingo'), 42)),
    ).rejects.toMatchObject({
      code: 'write-failed',
    } satisfies Partial<TamabuddyPersistenceError>);
  });
});
