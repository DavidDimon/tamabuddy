import {
  AttentionReason,
  TamabuddyState,
} from '../../../domain/models/TamabuddyState.js';
import { TamabuddyCommand } from '../../../domain/rules/actions.js';
import { assertDuration, minutes } from '../durations.js';
import {
  Mulberry32RandomSource,
  SEEDED_RANDOM_VERSION,
} from '../random/Mulberry32RandomSource.js';
import { RandomSource } from '../random/RandomSource.js';
import {
  AttentionObservation,
  attentionObservations,
  proposalTime,
} from './attentionObservations.js';
import { OwnerStrategy } from './OwnerStrategy.js';

export interface RandomOwnerConfiguration {
  readonly responseProbability?: number;
  readonly minimumResponseDelay?: number;
  readonly maximumResponseDelay?: number;
}

export interface NormalizedRandomOwnerConfiguration {
  readonly responseProbability: number;
  readonly minimumResponseDelay: number;
  readonly maximumResponseDelay: number;
}

export interface RandomOwnerStrategy extends OwnerStrategy {
  readonly seed: number;
  readonly prngVersion: typeof SEEDED_RANDOM_VERSION;
  readonly configuration: NormalizedRandomOwnerConfiguration;
}

interface AttentionDecision {
  readonly respond: boolean;
  readonly responseDelay: number;
}

export function randomOwner(
  seed: number,
  configuration: RandomOwnerConfiguration = {},
): RandomOwnerStrategy {
  const source = new Mulberry32RandomSource(seed);
  const normalized = normalizeRandomOwnerConfiguration(configuration);
  return randomOwnerUsing(source, seed, normalized);
}

export function normalizeRandomOwnerConfiguration(
  configuration: RandomOwnerConfiguration,
): NormalizedRandomOwnerConfiguration {
  const responseProbability = configuration.responseProbability ?? 0.75;
  const minimumResponseDelay = configuration.minimumResponseDelay ?? 0;
  const maximumResponseDelay =
    configuration.maximumResponseDelay ?? minutes(10);

  assertProbability(responseProbability, 'responseProbability');
  assertDuration(minimumResponseDelay, 'random owner minimumResponseDelay');
  assertDuration(maximumResponseDelay, 'random owner maximumResponseDelay');
  if (maximumResponseDelay < minimumResponseDelay) {
    throw new RangeError(
      'Random owner maximumResponseDelay cannot precede minimumResponseDelay',
    );
  }
  if (!Number.isSafeInteger(maximumResponseDelay - minimumResponseDelay + 1)) {
    throw new RangeError('Random owner response-delay range is too large');
  }

  return {
    responseProbability,
    minimumResponseDelay,
    maximumResponseDelay,
  };
}

function randomOwnerUsing(
  source: RandomSource,
  seed: number,
  configuration: NormalizedRandomOwnerConfiguration,
): RandomOwnerStrategy {
  const decisions = new Map<string, AttentionDecision>();

  return {
    name: 'random-owner',
    seed,
    prngVersion: SEEDED_RANDOM_VERSION,
    configuration: { ...configuration },
    propose(context) {
      for (const observation of attentionObservations(context)) {
        const key = attentionKey(observation);
        let decision = decisions.get(key);
        if (decision === undefined) {
          decision = decide(source, configuration);
          decisions.set(key, decision);
        }
        if (!decision.respond) continue;

        const at = proposalTime(observation, context, decision.responseDelay);
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

function decide(
  source: RandomSource,
  configuration: NormalizedRandomOwnerConfiguration,
): AttentionDecision {
  const respond = next(source) < configuration.responseProbability;
  const range =
    configuration.maximumResponseDelay - configuration.minimumResponseDelay + 1;
  const responseDelay =
    configuration.minimumResponseDelay + Math.floor(next(source) * range);
  return { respond, responseDelay };
}

function next(source: RandomSource): number {
  const value = source.next();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random source must return values in [0, 1)');
  }
  return value;
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

function attentionKey(observation: AttentionObservation): string {
  return `${observation.reason}:${observation.openedAt}`;
}

function assertProbability(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1`);
  }
}
