import { useSyncExternalStore } from 'react';

import { tamabuddyEngineClient } from '../services/TamabuddyEngineClient.js';

export function useTamabuddyEngine() {
  const snapshot = useSyncExternalStore(
    tamabuddyEngineClient.subscribe,
    tamabuddyEngineClient.getSnapshot,
    tamabuddyEngineClient.getSnapshot,
  );

  return {
    dispatch: tamabuddyEngineClient.dispatch,
    snapshot,
  };
}
