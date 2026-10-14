import { MASCOT_CATALOG, type MascotId } from './catalog/index.js';
import './mascot.css';

export interface MascotSelectionScreenProps {
  readonly error: string | null;
  readonly onSelect: (mascotId: MascotId) => void;
}

export function MascotSelectionScreen({
  error,
  onSelect,
}: MascotSelectionScreenProps) {
  return (
    <main className="desktop-shell selection-screen">
      <header className="selection-screen__header">
        <span>PRIMEIRO PASSO</span>
        <h1>Escolha seu mascote</h1>
        <p>Essa será a aparência do seu companheiro.</p>
      </header>

      <section className="mascot-grid" aria-label="Mascotes disponíveis">
        {MASCOT_CATALOG.map((manifest) => (
          <button
            className="mascot-option"
            data-mascot={manifest.id}
            key={manifest.id}
            onClick={() => onSelect(manifest.id)}
            type="button"
          >
            <pre aria-hidden="true">
              {manifest.stages.egg.animations.idle.frames[0].art}
            </pre>
            <strong>{manifest.name}</strong>
          </button>
        ))}
      </section>

      <p
        aria-live="polite"
        className="selection-screen__message"
        role={error === null ? 'status' : 'alert'}
      >
        {error}
      </p>
    </main>
  );
}
