import type {
  TamabuddyCommand,
  TamabuddyState,
} from '@tamabuddy/tamabuddy-engine';

import type {
  DesktopPet,
  DesktopPetAction,
} from '../../../entities/pet/index.js';
import { randomGameOutcome } from '../../game/index.js';

export function toDesktopPet(state: TamabuddyState): DesktopPet {
  return {
    behavior: state.behavior,
    createdAt: state.createdAt,
    happiness: state.happiness,
    health: state.health,
    hunger: state.hunger,
    isIll: state.illness !== null,
    lastProcessedAt: state.lastProcessedAt,
    needsAttention: state.attention !== null,
    poopCount: state.poopCount,
    stage: state.stage,
  };
}

export function toTamabuddyCommand(action: DesktopPetAction): TamabuddyCommand {
  if (action === 'play') {
    return { type: 'play', result: randomGameOutcome() };
  }
  return { type: action };
}
