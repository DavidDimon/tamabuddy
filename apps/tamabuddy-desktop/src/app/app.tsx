import './app.css';

import type { Stage, TamabuddyCommand } from '@tamabuddy/tamabuddy-engine';

import { PingoSprite } from '../features/mascot/PingoSprite.js';
import { ActionMenu } from '../features/pet/components/ActionMenu.js';
import { useTamabuddyDesktop } from '../features/pet/hooks/useTamabuddyDesktop.js';

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
  const { dispatch, message, state, status } = useTamabuddyDesktop();
  const day =
    Math.floor((state.lastProcessedAt - state.createdAt) / DAY_MS) + 1;
  const handleAction = (command: TamabuddyCommand) => {
    void dispatch(command).catch(() => undefined);
  };

  return (
    <main className="desktop-shell">
      <header className="identity-bar">
        <div>
          <strong>PINGO</strong>
          <span>{STAGE_LABELS[state.stage]}</span>
        </div>
        <span>dia {day.toString().padStart(2, '0')}</span>
      </header>

      <section className="status-bar" aria-label="Estado de Pingo">
        <Meter label="fome" value={state.hunger} />
        <Meter label="feliz" value={state.happiness} />
        <Meter label="saúde" value={state.health} />
      </section>

      <section className="mascot-stage" aria-label="Pingo">
        <PingoSprite state={state} />
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
