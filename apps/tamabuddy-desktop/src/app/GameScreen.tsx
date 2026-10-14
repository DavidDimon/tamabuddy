import { useState } from 'react';

import type { MascotManifest } from '../features/mascot/index.js';
import {
  type ActionMenuProps,
  useTamabuddyDesktop,
} from '../features/pet/index.js';
import {
  desktopPreferencesStore,
  SettingsScreen,
} from '../features/settings/index.js';
import { GameView } from './GameView.js';

interface GameScreenProps {
  readonly manifest: MascotManifest;
  readonly onResetComplete: () => void;
}

export function GameScreen({ manifest, onResetComplete }: GameScreenProps) {
  const [screen, setScreen] = useState<'game' | 'settings'>('game');
  const {
    dispatch,
    hatchDeadline,
    hatchNow,
    message,
    reaction,
    refresh,
    reset,
    state,
    status,
  } = useTamabuddyDesktop();
  const handleAction: ActionMenuProps['onAction'] = (command) => {
    void dispatch(command).catch(() => undefined);
  };
  const handleReset = async () => {
    await reset();
    desktopPreferencesStore.clear();
    onResetComplete();
  };
  const handleHatchNow = async () => {
    await hatchNow();
    setScreen('game');
  };

  if (screen === 'settings') {
    return (
      <SettingsScreen
        canHatchNow={state.stage === 'egg'}
        disabled={status !== 'ready'}
        onBack={() => setScreen('game')}
        onHatchNow={handleHatchNow}
        onReset={handleReset}
      />
    );
  }

  return (
    <GameView
      busy={status === 'loading'}
      disabled={status !== 'ready'}
      hatchDeadline={hatchDeadline}
      manifest={manifest}
      message={message}
      messageIsError={status === 'error'}
      onAction={handleAction}
      onOpenSettings={() => setScreen('settings')}
      onRefresh={() => void refresh().catch(() => undefined)}
      reaction={reaction}
      state={state}
    />
  );
}
