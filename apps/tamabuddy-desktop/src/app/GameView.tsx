import type { DesktopPet } from '../entities/pet/index.js';
import { MascotSprite, type MascotManifest } from '../features/mascot/index.js';
import {
  ActionMenu,
  type ActionMenuProps,
  type DesktopReaction,
  getPetDay,
  getStageLabel,
  HatchCountdown,
  Meter,
} from '../features/pet/index.js';

interface GameViewProps {
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly hatchDeadline: number | null;
  readonly manifest: MascotManifest;
  readonly message: string;
  readonly messageIsError: boolean;
  readonly onAction: ActionMenuProps['onAction'];
  readonly onOpenSettings: () => void;
  readonly onRefresh: () => void;
  readonly reaction: DesktopReaction | null;
  readonly state: DesktopPet;
}

export function GameView({
  busy,
  disabled,
  hatchDeadline,
  manifest,
  message,
  messageIsError,
  onAction,
  onOpenSettings,
  onRefresh,
  reaction,
  state,
}: GameViewProps) {
  const day = getPetDay(state);

  return (
    <main aria-busy={busy} className="desktop-shell">
      <header className="identity-bar">
        <div>
          <strong>{manifest.name}</strong>
          <span>{getStageLabel(state.stage)}</span>
        </div>
        <div className="identity-bar__tools">
          <span>dia {day.toString().padStart(2, '0')}</span>
          <button
            aria-label="Abrir configurações"
            className="settings-button"
            onClick={onOpenSettings}
            type="button"
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
          <HatchCountdown deadline={hatchDeadline} onElapsed={onRefresh} />
        )}
        <p
          className={`mascot-message${
            messageIsError
              ? ' mascot-message--error'
              : busy
                ? ' mascot-message--busy'
                : ''
          }`}
          role={messageIsError ? 'alert' : 'status'}
        >
          {message}
        </p>
      </section>

      <ActionMenu disabled={disabled} state={state} onAction={onAction} />
    </main>
  );
}
