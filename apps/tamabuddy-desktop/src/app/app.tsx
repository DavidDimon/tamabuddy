import './app.css';

import { useState } from 'react';

import {
  getHatchDeadline,
  type Stage,
  type TamabuddyCommand,
} from '@tamabuddy/tamabuddy-engine';

import {
  findMascotManifest,
  type MascotId,
} from '../features/mascot/catalog/index.js';
import type { MascotManifest } from '../features/mascot/mascotManifest.js';
import { MascotSelectionScreen } from '../features/mascot/MascotSelectionScreen.js';
import { MascotSprite } from '../features/mascot/MascotSprite.js';
import { ActionMenu } from '../features/pet/components/ActionMenu.js';
import { HatchCountdown } from '../features/pet/components/HatchCountdown.js';
import { useTamabuddyDesktop } from '../features/pet/hooks/useTamabuddyDesktop.js';
import { desktopPreferencesStore } from '../features/settings/DesktopPreferencesStore.js';
import { SettingsScreen } from '../features/settings/SettingsScreen.js';

const STAGE_LABELS: Readonly<Record<Stage, string>> = {
  egg: 'ovo',
  baby: 'bebê',
  child: 'criança',
  teen: 'jovem',
  adult: 'adulto',
  elder: 'ancião',
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function App() {
  const [mascotId, setMascotId] = useState<MascotId | null>(() =>
    desktopPreferencesStore.getMascotId(),
  );
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const manifest = mascotId === null ? undefined : findMascotManifest(mascotId);
  const handleMascotSelection = (selectedMascotId: MascotId) => {
    try {
      desktopPreferencesStore.setMascotId(selectedMascotId);
      setMascotId(selectedMascotId);
      setSelectionError(null);
    } catch {
      setSelectionError('Não foi possível salvar a escolha. Tente novamente.');
    }
  };

  if (manifest === undefined) {
    return (
      <MascotSelectionScreen
        error={selectionError}
        onSelect={handleMascotSelection}
      />
    );
  }

  return (
    <GameScreen manifest={manifest} onResetComplete={() => setMascotId(null)} />
  );
}

interface GameScreenProps {
  readonly manifest: MascotManifest;
  readonly onResetComplete: () => void;
}

function GameScreen({ manifest, onResetComplete }: GameScreenProps) {
  const [screen, setScreen] = useState<'game' | 'settings'>('game');
  const {
    dispatch,
    hatchNow,
    message,
    reaction,
    refresh,
    reset,
    state,
    status,
  } = useTamabuddyDesktop();
  const day =
    Math.floor((state.lastProcessedAt - state.createdAt) / DAY_MS) + 1;
  const hatchDeadline = getHatchDeadline(state);
  const handleAction = (command: TamabuddyCommand) => {
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
    <main className="desktop-shell">
      <header className="identity-bar">
        <div>
          <strong>{manifest.name}</strong>
          <span>{STAGE_LABELS[state.stage]}</span>
        </div>
        <div className="identity-bar__tools">
          <span>dia {day.toString().padStart(2, '0')}</span>
          <button
            className="settings-button"
            onClick={() => setScreen('settings')}
            type="button"
            aria-label="Abrir configurações"
          >
            <span aria-hidden="true">⚙</span>
          </button>
        </div>
      </header>

      <section className="status-bar" aria-label={`Estado de ${manifest.name}`}>
        <Meter label="fome" value={state.hunger} />
        <Meter label="feliz" value={state.happiness} />
        <Meter label="saúde" value={state.health} />
      </section>

      <section className="mascot-stage" aria-label={manifest.name}>
        <MascotSprite
          key={
            reaction === null
              ? `stable-${state.stage}`
              : `${reaction.key}-${reaction.sequence}`
          }
          manifest={manifest}
          reaction={reaction?.key}
          state={state}
        />
        {hatchDeadline === null ? null : (
          <HatchCountdown
            deadline={hatchDeadline}
            onElapsed={() => void refresh().catch(() => undefined)}
          />
        )}
        <p className="mascot-message">{message}</p>
      </section>

      <ActionMenu
        disabled={status !== 'ready'}
        state={state}
        onAction={handleAction}
      />
    </main>
  );
}

interface MeterProps {
  readonly label: string;
  readonly value: number;
}

function Meter({ label, value }: MeterProps) {
  return (
    <div className="meter">
      <span>{label}</span>
      <output aria-label={`${label}: ${value} de 4`}>
        {'■'.repeat(value)}
        <span aria-hidden="true">{'·'.repeat(4 - value)}</span>
      </output>
    </div>
  );
}

export default App;
