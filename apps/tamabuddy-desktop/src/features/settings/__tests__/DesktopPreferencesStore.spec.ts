import { DesktopPreferencesStore } from '../DesktopPreferencesStore.js';

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('DesktopPreferencesStore', () => {
  it('returns no selection when preferences have not been saved', () => {
    const store = new DesktopPreferencesStore(new MemoryStorage());

    expect(store.getMascotId()).toBeNull();
  });

  it('persists and restores a catalog mascot', () => {
    const storage = new MemoryStorage();
    const store = new DesktopPreferencesStore(storage);

    store.setMascotId('nexo');

    expect(store.getMascotId()).toBe('nexo');
  });

  it.each([
    '{not-json',
    JSON.stringify({ schemaVersion: 2, mascotId: 'pingo' }),
    JSON.stringify({ schemaVersion: 1, mascotId: 'unknown' }),
  ])('ignores invalid persisted preferences', (serialized) => {
    const storage = new MemoryStorage();
    storage.setItem('tamabuddy.desktop.preferences.v1', serialized);

    expect(new DesktopPreferencesStore(storage).getMascotId()).toBeNull();
  });

  it('treats an unavailable storage read as no selection', () => {
    const store = new DesktopPreferencesStore({
      getItem: () => {
        throw new Error('storage unavailable');
      },
      removeItem: () => undefined,
      setItem: () => undefined,
    });

    expect(store.getMascotId()).toBeNull();
  });

  it('clears the persisted selection', () => {
    const store = new DesktopPreferencesStore(new MemoryStorage());
    store.setMascotId('broto');

    store.clear();

    expect(store.getMascotId()).toBeNull();
  });
});
