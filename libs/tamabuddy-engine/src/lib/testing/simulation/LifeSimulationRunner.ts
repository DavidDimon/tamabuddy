import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import {
  cloneTamabuddyState,
  TamabuddyState,
} from '../../domain/models/TamabuddyState.js';
import { TamabuddyCommand } from '../../domain/rules/actions.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';
import { TamabuddyEngine } from '../../engine/TamabuddyEngine.js';
import { TamabuddyProcessor } from '../../engine/processors/TamabuddyProcessor.js';
import { TamabuddyProcessingTraceEntry } from '../../engine/processors/TamabuddyProcessingTrace.js';
import { InMemoryTamabuddyRepository } from '../../infrastructure/persistence/InMemoryTamabuddyRepository.js';
import { assertDuration } from './durations.js';
import { deriveLifeEvents } from './deriveLifeEvents.js';
import {
  CommandOutcome,
  LifeTimeline,
  LifeTimelineEntry,
  TimelineSnapshot,
} from './LifeTimeline.js';
import { VirtualClock } from './VirtualClock.js';

export interface ScheduledCommand {
  readonly at: number;
  readonly command: TamabuddyCommand;
}

export interface LifeSimulationPlan {
  readonly initial: Tamabuddy | TamabuddyState;
  readonly commands?: readonly ScheduledCommand[];
  readonly until?: number;
}

export class LifeSimulationRunner {
  async run(plan: LifeSimulationPlan): Promise<LifeTimeline> {
    const initial = initialTamabuddy(plan.initial);
    const initialState = initial.snapshot();
    const origin = initialState.lastProcessedAt;
    const commands = (plan.commands ?? []).map((scheduled) => ({
      at: scheduled.at,
      command: { ...scheduled.command },
    }));
    const duration = validatePlan(commands, plan.until);
    assertAbsoluteTimestamp(origin, duration);

    const clock = new VirtualClock(origin);
    const repository = new InMemoryTamabuddyRepository();
    const engine = new TamabuddyEngine(clock, repository);
    const processor = new TamabuddyProcessor(clock);
    const entries: LifeTimelineEntry[] = [];
    await repository.save(initial);

    for (const scheduled of commands) {
      clock.set(origin + scheduled.at);
      const advanced = await advanceWithTrace(
        initial.id,
        processor,
        repository,
        origin,
        entries,
      );
      if (advanced.snapshot().behavior === 'dead') {
        throw new RangeError(
          `Cannot execute command at offset ${scheduled.at} after death`,
        );
      }

      const before = advanced.snapshot();
      const result = await engine.command(initial.id, scheduled.command);
      if (result === null) {
        throw new Error('Simulation repository lost the Tamabuddy');
      }

      const commandEvent = toCommandOutcome(
        scheduled.command,
        before,
        result.state,
        result.accepted,
        result.rejection,
        origin,
      );
      entries.push(commandEvent);
      entries.push(
        ...deriveLifeEvents(
          {
            at: result.state.lastProcessedAt,
            before,
            after: result.state,
          },
          origin,
        ),
      );
    }

    const finalOffset = plan.until ?? commands.at(-1)?.at ?? 0;
    if (
      plan.until !== undefined &&
      (commands.length === 0 || finalOffset > (commands.at(-1)?.at ?? 0))
    ) {
      clock.set(origin + finalOffset);
      await advanceWithTrace(
        initial.id,
        processor,
        repository,
        origin,
        entries,
      );
      await engine.load(initial.id);
    }

    const finalTamabuddy = await repository.findById(initial.id);
    if (finalTamabuddy === null) {
      throw new Error('Simulation repository lost the Tamabuddy');
    }

    return new LifeTimeline(
      initialState,
      finalTamabuddy.snapshot(),
      entries,
      duration,
    );
  }
}

async function advanceWithTrace(
  id: TamabuddyId,
  processor: TamabuddyProcessor,
  repository: InMemoryTamabuddyRepository,
  origin: number,
  entries: LifeTimelineEntry[],
): Promise<Tamabuddy> {
  const stored = await repository.findById(id);
  if (stored === null) {
    throw new Error('Simulation repository lost the Tamabuddy');
  }

  const result = processor.processWithTrace(stored);
  for (const transition of result.trace) {
    entries.push(toSnapshot(transition, origin));
    entries.push(...deriveLifeEvents(transition, origin));
  }
  await repository.save(result.tamabuddy);
  return result.tamabuddy;
}

function toSnapshot(
  transition: TamabuddyProcessingTraceEntry,
  origin: number,
): TimelineSnapshot {
  return {
    kind: 'snapshot',
    at: transition.at,
    offset: transition.at - origin,
    before: cloneTamabuddyState(transition.before),
    after: cloneTamabuddyState(transition.after),
  };
}

function toCommandOutcome(
  command: TamabuddyCommand,
  before: TamabuddyState,
  after: TamabuddyState,
  accepted: boolean,
  rejection: CommandOutcome['rejection'],
  origin: number,
): CommandOutcome {
  return {
    kind: 'event',
    type: 'command',
    at: after.lastProcessedAt,
    offset: after.lastProcessedAt - origin,
    command: { ...command },
    accepted,
    ...(rejection === undefined ? {} : { rejection }),
    before: cloneTamabuddyState(before),
    after: cloneTamabuddyState(after),
  };
}

function initialTamabuddy(initial: Tamabuddy | TamabuddyState): Tamabuddy {
  return Tamabuddy.restore(
    initial instanceof Tamabuddy ? initial.snapshot() : initial,
  );
}

function validatePlan(
  commands: readonly ScheduledCommand[],
  until: number | undefined,
): number {
  let previous = 0;
  commands.forEach((scheduled, index) => {
    assertDuration(scheduled.at, `commands[${index}].at`);
    if (scheduled.at < previous) {
      throw new RangeError('Scheduled commands cannot move backwards');
    }
    previous = scheduled.at;
  });

  if (until !== undefined) {
    assertDuration(until, 'until');
    if (until < previous) {
      throw new RangeError('Simulation until cannot precede a command');
    }
    return until;
  }
  return previous;
}

function assertAbsoluteTimestamp(origin: number, duration: number): void {
  if (!Number.isSafeInteger(origin + duration)) {
    throw new RangeError('Simulation timestamp exceeds the safe integer range');
  }
}
