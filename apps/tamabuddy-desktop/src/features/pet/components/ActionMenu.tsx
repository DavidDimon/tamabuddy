import { useEffect } from 'react';

import type {
  TamabuddyCommand,
  TamabuddyState,
} from '@tamabuddy/tamabuddy-engine';

import { randomGameOutcome } from '../../game/randomGameOutcome.js';

interface ActionDefinition {
  readonly key: string;
  readonly label: string;
  readonly command: (state: TamabuddyState) => TamabuddyCommand;
}

const ACTIONS: readonly ActionDefinition[] = [
  { key: '1', label: 'Comida', command: () => ({ type: 'feedMeal' }) },
  {
    key: '2',
    label: 'Brincar',
    command: () => ({
      type: 'play',
      result: randomGameOutcome(),
    }),
  },
  { key: '3', label: 'Limpar', command: () => ({ type: 'clean' }) },
  { key: '4', label: 'Luz', command: () => ({ type: 'turnLightsOff' }) },
  { key: '5', label: 'Remédio', command: () => ({ type: 'giveMedicine' }) },
  {
    key: '6',
    label: 'Disciplina',
    command: () => ({ type: 'discipline' }),
  },
];

export interface ActionMenuProps {
  readonly disabled?: boolean;
  readonly state: TamabuddyState;
  readonly onAction: (command: TamabuddyCommand) => void;
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
      onAction(action.command(state));
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
          onClick={() => onAction(action.command(state))}
          type="button"
        >
          <kbd>{action.key}</kbd>
          <span>{action.label}</span>
        </button>
      ))}
    </nav>
  );
}
