import { useEffect, useSyncExternalStore } from 'react';

import { tamabuddyDesktopClient } from '../services/TamabuddyDesktopClient.js';

const REFRESH_INTERVAL_MS = 30_000;

export function useTamabuddyDesktop() {
  const snapshot = useSyncExternalStore(
    tamabuddyDesktopClient.subscribe,
    tamabuddyDesktopClient.getSnapshot,
    tamabuddyDesktopClient.getSnapshot,
  );

  useEffect(() => {
    const refresh = () => {
      void tamabuddyDesktopClient.refresh().catch(() => undefined);
    };
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    refresh();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return {
    ...snapshot,
    dispatch: tamabuddyDesktopClient.dispatch,
  };
}
