import {
  AttentionReason,
  TamabuddyState,
} from '../../../domain/models/TamabuddyState.js';
import { TamabuddyCommand } from '../../../domain/rules/actions.js';
import { assertDuration } from '../durations.js';
import {
  attentionObservations,
  proposalTime,
} from './attentionObservations.js';
import { OwnerStrategy } from './OwnerStrategy.js';

export interface PerfectOwnerConfiguration {
  readonly responseDelay?: number;
}

export function perfectOwner(
  configuration: PerfectOwnerConfiguration = {},
): OwnerStrategy {
  const responseDelay = configuration.responseDelay ?? 0;
  assertDuration(responseDelay, 'perfect owner responseDelay');

  return {
    name: 'perfect-owner',
    propose(context) {
      for (const observation of attentionObservations(context)) {
        const at = proposalTime(observation, context, responseDelay);
        if (at === null) continue;
        return {
          at,
          command: commandFor(observation.reason, observation.state),
        };
      }
      return null;
    },
  };
}

function commandFor(
  reason: AttentionReason,
  state: TamabuddyState,
): TamabuddyCommand {
  switch (reason) {
    case 'sickness':
      if (state.illness?.cause === 'hygiene' && state.poopCount > 0) {
        return { type: 'clean' };
      }
      return { type: 'giveMedicine' };
    case 'poop':
      return { type: 'clean' };
    case 'hunger':
      return { type: 'feedMeal' };
    case 'happiness':
      return { type: 'feedSnack' };
    case 'sleep':
      return { type: 'turnLightsOff' };
    case 'discipline':
      return { type: 'discipline' };
  }
}
