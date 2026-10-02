import { useSyncExternalStore } from 'react';

import { tamagotchiEngineClient } from '../services/TamagotchiEngineClient.js';

export function useTamagotchiEngine() {
  const snapshot = useSyncExternalStore(
    tamagotchiEngineClient.subscribe,
    tamagotchiEngineClient.getSnapshot,
    tamagotchiEngineClient.getSnapshot,
  );

  return {
    dispatch: tamagotchiEngineClient.dispatch,
    snapshot,
  };
}
