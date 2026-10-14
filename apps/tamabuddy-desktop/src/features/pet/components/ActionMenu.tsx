import { useEffect } from 'react';

import type {
  DesktopPet,
  DesktopPetAction,
} from '../../../entities/pet/index.js';
import '../pet.css';

interface ActionDefinition {
  readonly key: string;
  readonly label: string;
  readonly action: DesktopPetAction;
}

const ACTIONS: readonly ActionDefinition[] = [
  { key: '1', label: 'Comida', action: 'feedMeal' },
  { key: '2', label: 'Brincar', action: 'play' },
  { key: '3', label: 'Limpar', action: 'clean' },
  { key: '4', label: 'Luz', action: 'turnLightsOff' },
  { key: '5', label: 'Remédio', action: 'giveMedicine' },
  { key: '6', label: 'Disciplina', action: 'discipline' },
];

export interface ActionMenuProps {
  readonly disabled?: boolean;
  readonly state: DesktopPet;
  readonly onAction: (action: DesktopPetAction) => void;
}

export function ActionMenu({
  disabled = false,
  state,
  onAction,
}: ActionMenuProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = ACTIONS.find((candidate) => candidate.key === event.key);
      if (action === undefined || disabled || state.behavior === 'dead') return;
      event.preventDefault();
      onAction(action.action);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onAction, state]);

  return (
    <nav className="action-menu" aria-label="Cuidados">
      {ACTIONS.map((action) => (
        <button
          className="action-menu__button"
          disabled={disabled || state.behavior === 'dead'}
          key={action.key}
          onClick={() => onAction(action.action)}
          type="button"
        >
          <kbd>{action.key}</kbd>
          <span>{action.label}</span>
        </button>
      ))}
    </nav>
  );
}
