import './app.css';

import { useState } from 'react';

import {
  findMascotManifest,
  MascotSelectionScreen,
  type MascotId,
} from '../features/mascot/index.js';
import { desktopPreferencesStore } from '../features/settings/index.js';
import { GameScreen } from './GameScreen.js';

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

export default App;
