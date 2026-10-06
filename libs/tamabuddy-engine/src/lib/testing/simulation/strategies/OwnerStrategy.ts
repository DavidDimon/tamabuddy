import { TamabuddyCommand } from '../../../domain/rules/actions.js';
import { ScheduledCommand } from '../LifeSimulationRunner.js';
import { LifeTimeline } from '../LifeTimeline.js';

export interface OwnerStrategyContext {
  readonly timeline: LifeTimeline;
  readonly proposals: readonly ScheduledCommand[];
  readonly until: number;
}

export interface OwnerStrategy {
  readonly name: string;
  propose(context: OwnerStrategyContext): ScheduledCommand | null;
}

export function cloneScheduledCommand(
  proposal: ScheduledCommand,
): ScheduledCommand {
  return { at: proposal.at, command: { ...proposal.command } };
}

export function assertOwnerCommand(
  command: unknown,
): asserts command is TamabuddyCommand {
  if (typeof command !== 'object' || command === null || !('type' in command)) {
    throw new RangeError('Owner strategies require valid commands');
  }
  const candidate = command as {
    readonly type: unknown;
    readonly result?: unknown;
  };
  if (
    candidate.type === 'play' &&
    (candidate.result === 'win' || candidate.result === 'loss')
  ) {
    return;
  }
  if (
    candidate.type === 'feedMeal' ||
    candidate.type === 'feedSnack' ||
    candidate.type === 'clean' ||
    candidate.type === 'giveMedicine' ||
    candidate.type === 'discipline' ||
    candidate.type === 'turnLightsOff'
  ) {
    return;
  }
  throw new RangeError(`Unsupported owner command: ${String(candidate.type)}`);
}
