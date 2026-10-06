import { LifeLab as DeveloperLifeLab } from 'virtual:life-lab';

import { PetStatus } from '../features/pet/components/PetStatus.js';

export interface AppProps {
  readonly developerMode?: boolean;
}

export function App({ developerMode = import.meta.env.DEV }: AppProps) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">A tiny life, faithfully simulated</p>
          <h1>Tamabuddy</h1>
        </div>
      </header>
      <section className="player-panel" aria-label="Tamabuddy player">
        <PetStatus />
      </section>
      {developerMode && DeveloperLifeLab !== null && <DeveloperLifeLab />}
    </main>
  );
}

export default App;
