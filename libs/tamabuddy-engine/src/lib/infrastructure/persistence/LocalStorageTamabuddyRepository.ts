import { TamabuddyRepository } from '../../application/ports/TamabuddyRepository.js';
import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyState } from '../../domain/models/TamabuddyState.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';

const SAVE_KEY_PREFIX = 'tamabuddy.save.v1';

export interface StringStorage {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
}

export type TamabuddyPersistenceErrorCode =
  'read-failed' | 'invalid-json' | 'invalid-state' | 'write-failed';

export class TamabuddyPersistenceError extends Error {
  constructor(
    readonly code: TamabuddyPersistenceErrorCode,
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'TamabuddyPersistenceError';
  }
}

export class LocalStorageTamabuddyRepository implements TamabuddyRepository {
  constructor(private readonly storage: StringStorage) {}

  async findById(id: TamabuddyId): Promise<Tamabuddy | null> {
    let serialized: string | null;

    try {
      serialized = this.storage.getItem(saveKey(id));
    } catch (error) {
      throw new TamabuddyPersistenceError(
        'read-failed',
        'Could not read the Tamabuddy save',
        error,
      );
    }

    if (serialized === null) return null;

    let state: unknown;
    try {
      state = JSON.parse(serialized);
    } catch (error) {
      throw new TamabuddyPersistenceError(
        'invalid-json',
        'The Tamabuddy save is not valid JSON',
        error,
      );
    }

    try {
      return Tamabuddy.restore(state as TamabuddyState);
    } catch (error) {
      throw new TamabuddyPersistenceError(
        'invalid-state',
        'The Tamabuddy save contains an invalid state',
        error,
      );
    }
  }

  async save(tamabuddy: Tamabuddy): Promise<void> {
    try {
      this.storage.setItem(
        saveKey(tamabuddy.id),
        JSON.stringify(tamabuddy.snapshot()),
      );
    } catch (error) {
      throw new TamabuddyPersistenceError(
        'write-failed',
        'Could not write the Tamabuddy save',
        error,
      );
    }
  }
}

function saveKey(id: TamabuddyId): string {
  return `${SAVE_KEY_PREFIX}.${encodeURIComponent(id.value)}`;
}
