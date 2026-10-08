import { isMascotId, type MascotId } from '../mascot/catalog/index.js';

const PREFERENCES_KEY = 'tamabuddy.desktop.preferences.v1';
const PREFERENCES_SCHEMA_VERSION = 1;

export interface DesktopPreferencesStorage {
  readonly getItem: (key: string) => string | null;
  readonly removeItem: (key: string) => void;
  readonly setItem: (key: string, value: string) => void;
}

interface PersistedDesktopPreferences {
  readonly schemaVersion: typeof PREFERENCES_SCHEMA_VERSION;
  readonly mascotId: MascotId;
}

export class DesktopPreferencesStore {
  constructor(private readonly storage: DesktopPreferencesStorage) {}

  getMascotId(): MascotId | null {
    try {
      const serialized = this.storage.getItem(PREFERENCES_KEY);
      if (serialized === null) return null;
      const preferences = JSON.parse(
        serialized,
      ) as Partial<PersistedDesktopPreferences>;
      return preferences.schemaVersion === PREFERENCES_SCHEMA_VERSION &&
        typeof preferences.mascotId === 'string' &&
        isMascotId(preferences.mascotId)
        ? preferences.mascotId
        : null;
    } catch {
      return null;
    }
  }

  setMascotId(mascotId: MascotId): void {
    const preferences: PersistedDesktopPreferences = {
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      mascotId,
    };
    this.storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }

  clear(): void {
    this.storage.removeItem(PREFERENCES_KEY);
  }
}

export const desktopPreferencesStore = new DesktopPreferencesStore(
  window.localStorage,
);
