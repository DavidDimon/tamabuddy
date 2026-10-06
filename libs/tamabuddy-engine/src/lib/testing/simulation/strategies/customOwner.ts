import { AttentionReason } from '../../../domain/models/TamabuddyState.js';
import { TamabuddyCommand } from '../../../domain/rules/actions.js';
import { assertDuration } from '../durations.js';
import {
  attentionObservations,
  commandWasTriedForAttention,
  proposalTime,
} from './attentionObservations.js';
import { assertOwnerCommand, OwnerStrategy } from './OwnerStrategy.js';

export interface CustomOwnerConfiguration {
  readonly responseDelay?: number;
  readonly responses?: Partial<
    Readonly<Record<AttentionReason, TamabuddyCommand>>
  >;
  readonly ignore?: readonly AttentionReason[];
}

const attentionReasons: readonly AttentionReason[] = [
  'sickness',
  'poop',
  'hunger',
  'happiness',
  'sleep',
  'discipline',
];

export function customOwner(
  configuration: CustomOwnerConfiguration,
): OwnerStrategy {
  const responseDelay = configuration.responseDelay ?? 0;
  assertDuration(responseDelay, 'custom owner responseDelay');
  const responses = validateResponses(configuration.responses ?? {});
  const ignored = validateIgnored(configuration.ignore ?? []);

  for (const reason of ignored) {
    if (responses[reason] !== undefined) {
      throw new RangeError(
        `Custom owner cannot both respond to and ignore ${reason}`,
      );
    }
  }
  if (Object.keys(responses).length === 0 && ignored.size === 0) {
    throw new RangeError('Custom owner requires a response or ignored reason');
  }

  return {
    name: 'custom-owner',
    propose(context) {
      for (const observation of attentionObservations(context)) {
        if (ignored.has(observation.reason)) continue;
        const command = responses[observation.reason];
        if (
          command === undefined ||
          commandWasTriedForAttention(context, observation, command)
        ) {
          continue;
        }
        const at = proposalTime(observation, context, responseDelay);
        if (at !== null) return { at, command: { ...command } };
      }
      return null;
    },
  };
}

function validateResponses(
  responses: Readonly<Partial<Record<AttentionReason, TamabuddyCommand>>>,
): Partial<Record<AttentionReason, TamabuddyCommand>> {
  const validated: Partial<Record<AttentionReason, TamabuddyCommand>> = {};
  for (const [reason, command] of Object.entries(responses)) {
    assertAttentionReason(reason);
    assertOwnerCommand(command);
    validated[reason] = { ...command };
  }
  return validated;
}

function validateIgnored(
  reasons: readonly AttentionReason[],
): Set<AttentionReason> {
  const ignored = new Set<AttentionReason>();
  for (const reason of reasons) {
    assertAttentionReason(reason);
    if (ignored.has(reason)) {
      throw new RangeError(`Custom owner repeats ignored reason ${reason}`);
    }
    ignored.add(reason);
  }
  return ignored;
}

function assertAttentionReason(
  reason: string,
): asserts reason is AttentionReason {
  if (!(attentionReasons as readonly string[]).includes(reason)) {
    throw new RangeError(`Unsupported attention reason: ${reason}`);
  }
}
