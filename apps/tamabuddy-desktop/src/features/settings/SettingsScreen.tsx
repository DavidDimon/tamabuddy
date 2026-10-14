import { useEffect, useState } from 'react';

import './settings.css';

export interface SettingsScreenProps {
  readonly canHatchNow: boolean;
  readonly disabled?: boolean;
  readonly onBack: () => void;
  readonly onHatchNow: () => Promise<void>;
  readonly onReset: () => Promise<void>;
}

export function SettingsScreen({
  canHatchNow,
  disabled = false,
  onBack,
  onHatchNow,
  onReset,
}: SettingsScreenProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hatching, setHatching] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || hatching || resetting) return;
      if (confirmingReset) {
        setConfirmingReset(false);
      } else {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmingReset, hatching, onBack, resetting]);

  const handleHatchNow = async () => {
    setHatching(true);
    setError(null);
    try {
      await onHatchNow();
    } catch {
      setError('Não foi possível chocar o ovo agora. Tente novamente.');
      setHatching(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setError(null);
    try {
      await onReset();
    } catch {
      setError('Não foi possível reiniciar o jogo. Tente novamente.');
      setResetting(false);
    }
  };

  return (
    <main className="desktop-shell settings-screen">
      <header className="settings-screen__header">
        <button
          aria-label="Voltar ao jogo"
          disabled={hatching || resetting}
          onClick={onBack}
          type="button"
        >
          ←
        </button>
        <h1>Configurações</h1>
      </header>

      <section className="settings-card" aria-labelledby="game-settings">
        <div>
          <h2 id="game-settings">Jogo</h2>
          <p>Gerencie o progresso deste mascote.</p>
        </div>

        <button
          className="settings-action"
          disabled={disabled || !canHatchNow || hatching || resetting}
          onClick={() => void handleHatchNow()}
          type="button"
        >
          <strong>{hatching ? 'Chocando...' : 'Chocar agora'}</strong>
          <span>
            {canHatchNow
              ? 'Encerra a espera do ovo imediatamente.'
              : 'Disponível apenas enquanto o mascote está no ovo.'}
          </span>
        </button>

        {confirmingReset ? (
          <div className="reset-confirmation" role="alert">
            <strong>Reiniciar todo o progresso?</strong>
            <p>O mascote voltará a ser um ovo e você fará uma nova escolha.</p>
            <div>
              <button
                autoFocus
                disabled={hatching || resetting}
                onClick={() => setConfirmingReset(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="danger-button"
                disabled={disabled || hatching || resetting}
                onClick={() => void handleReset()}
                type="button"
              >
                {resetting ? 'Reiniciando...' : 'Confirmar reset'}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="settings-action danger-button"
            disabled={disabled || hatching}
            onClick={() => setConfirmingReset(true)}
            type="button"
          >
            <strong>Reiniciar jogo</strong>
            <span>Apaga o progresso e volta à seleção.</span>
          </button>
        )}

        <p
          aria-live="polite"
          className="settings-error"
          role={error === null ? 'status' : 'alert'}
        >
          {error}
        </p>
      </section>
    </main>
  );
}
