import {
  AttentionReason,
  TamabuddyState,
} from '../../../domain/models/TamabuddyState.js';
import { TamabuddyCommand } from '../../../domain/rules/actions.js';
import { OwnerStrategyContext } from './OwnerStrategy.js';

export interface AttentionObservation {
  readonly reason: AttentionReason;
  readonly openedAt: number;
  readonly expiresAt: number;
  readonly openOffset: number;
  readonly state: TamabuddyState;
}

export function attentionObservations(
  context: OwnerStrategyContext,
): readonly AttentionObservation[] {
  const startOffset = context.proposals.at(-1)?.at ?? 0;
  const origin = context.timeline.origin;
  const observations: AttentionObservation[] = [];
  const keys = new Set<string>();
  const add = (state: TamabuddyState): void => {
    if (state.behavior === 'dead' || state.attention === null) return;
    const key = attentionKey(state.attention.reason, state.attention.openedAt);
    if (keys.has(key)) return;
    keys.add(key);
    observations.push({
      reason: state.attention.reason,
      openedAt: state.attention.openedAt,
      expiresAt: state.attention.expiresAt,
      openOffset: Math.max(0, state.attention.openedAt - origin),
      state,
    });
  };

  add(context.timeline.at(startOffset));
  for (const entry of context.timeline.entries) {
    if (entry.offset <= startOffset || entry.kind !== 'snapshot') continue;
    add(entry.after);
  }
  return observations;
}

export function proposalTime(
  observation: AttentionObservation,
  context: OwnerStrategyContext,
  responseDelay: number,
): number | null {
  const lastProposalAt = context.proposals.at(-1)?.at ?? 0;
  const at = Math.max(observation.openOffset + responseDelay, lastProposalAt);
  const expiresOffset = observation.expiresAt - context.timeline.origin;
  const deathOffset = context.timeline.events('died')[0]?.offset;
  if (
    at >= expiresOffset ||
    at > context.until ||
    (deathOffset !== undefined && at >= deathOffset)
  ) {
    return null;
  }
  return at;
}

export function commandWasTriedForAttention(
  context: OwnerStrategyContext,
  observation: AttentionObservation,
  command: TamabuddyCommand,
): boolean {
  return context.timeline
    .events('command')
    .some(
      (event) =>
        event.before.attention?.reason === observation.reason &&
        event.before.attention.openedAt === observation.openedAt &&
        commandsAreEqual(event.command, command),
    );
}

export function commandsAreEqual(
  first: TamabuddyCommand,
  second: TamabuddyCommand,
): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

function attentionKey(reason: AttentionReason, openedAt: number): string {
  return `${reason}:${openedAt}`;
}
