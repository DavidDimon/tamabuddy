import {
  AttentionReason,
  CareProfile,
  cloneTamabuddyState,
  IllnessCause,
  Stage,
  TamabuddyState,
} from '../../domain/models/TamabuddyState.js';
import {
  ActionRejection,
  TamabuddyCommand,
} from '../../domain/rules/actions.js';
import { assertDuration } from './durations.js';

interface TimelineEventBase {
  readonly kind: 'event';
  readonly at: number;
  readonly offset: number;
}

interface StateLifeEventBase extends TimelineEventBase {
  readonly state: TamabuddyState;
}

export interface HatchedLifeEvent extends StateLifeEventBase {
  readonly type: 'hatched';
}

export interface SickLifeEvent extends StateLifeEventBase {
  readonly type: 'sick';
  readonly cause: IllnessCause;
}

export interface CuredLifeEvent extends StateLifeEventBase {
  readonly type: 'cured';
  readonly cause: IllnessCause;
}

export interface EvolvedLifeEvent extends StateLifeEventBase {
  readonly type: 'evolved';
  readonly fromStage: Exclude<Stage, 'elder'>;
  readonly toStage: Exclude<Stage, 'egg'>;
  readonly score: number;
  readonly profile: CareProfile;
}

export interface SleepingLifeEvent extends StateLifeEventBase {
  readonly type: 'sleeping';
}

export interface WokeLifeEvent extends StateLifeEventBase {
  readonly type: 'woke';
}

export interface CareMistakeLifeEvent extends StateLifeEventBase {
  readonly type: 'care-mistake';
  readonly reason: AttentionReason;
}

export interface DiedLifeEvent extends StateLifeEventBase {
  readonly type: 'died';
}

export interface CommandOutcome extends TimelineEventBase {
  readonly type: 'command';
  readonly command: TamabuddyCommand;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
  readonly before: TamabuddyState;
  readonly after: TamabuddyState;
}

export type StateLifeEvent =
  | HatchedLifeEvent
  | SickLifeEvent
  | CuredLifeEvent
  | EvolvedLifeEvent
  | SleepingLifeEvent
  | WokeLifeEvent
  | CareMistakeLifeEvent
  | DiedLifeEvent;

export type LifeEvent = StateLifeEvent | CommandOutcome;

export interface TimelineSnapshot {
  readonly kind: 'snapshot';
  readonly at: number;
  readonly offset: number;
  readonly before: TamabuddyState;
  readonly after: TamabuddyState;
}

export type LifeTimelineEntry = TimelineSnapshot | LifeEvent;

export class LifeTimeline {
  private readonly initialState: TamabuddyState;
  private readonly finalSnapshot: TamabuddyState;
  private readonly timelineEntries: readonly LifeTimelineEntry[];

  constructor(
    initialState: TamabuddyState,
    finalState: TamabuddyState,
    entries: readonly LifeTimelineEntry[],
    readonly duration: number,
  ) {
    assertDuration(duration, 'timeline duration');
    this.initialState = cloneTamabuddyState(initialState);
    this.finalSnapshot = cloneTamabuddyState(finalState);
    this.timelineEntries = entries.map(cloneTimelineEntry);
  }

  get finalState(): TamabuddyState {
    return cloneTamabuddyState(this.finalSnapshot);
  }

  get origin(): number {
    return this.initialState.lastProcessedAt;
  }

  get entries(): readonly LifeTimelineEntry[] {
    return this.timelineEntries.map(cloneTimelineEntry);
  }

  events<Type extends LifeEvent['type']>(
    type: Type,
  ): readonly Extract<LifeEvent, { readonly type: Type }>[] {
    return this.timelineEntries
      .filter(
        (entry): entry is Extract<LifeEvent, { readonly type: Type }> =>
          entry.kind === 'event' && entry.type === type,
      )
      .map((event) => cloneLifeEvent(event));
  }

  at(offset: number): TamabuddyState {
    assertDuration(offset, 'timeline offset');
    if (offset > this.duration) {
      throw new RangeError('Timeline offset exceeds the simulation duration');
    }

    let state = this.initialState;
    for (const entry of this.timelineEntries) {
      if (entry.offset > offset) break;
      if (entry.kind === 'snapshot') state = entry.after;
      if (entry.kind === 'event' && entry.type === 'command') {
        state = entry.after;
      }
    }
    return cloneTamabuddyState(state);
  }
}

function cloneTimelineEntry(entry: LifeTimelineEntry): LifeTimelineEntry {
  if (entry.kind === 'snapshot') {
    return {
      ...entry,
      before: cloneTamabuddyState(entry.before),
      after: cloneTamabuddyState(entry.after),
    };
  }
  return cloneLifeEvent(entry);
}

function cloneLifeEvent<Event extends LifeEvent>(event: Event): Event {
  if (event.type === 'command') {
    return {
      ...event,
      command: { ...event.command },
      before: cloneTamabuddyState(event.before),
      after: cloneTamabuddyState(event.after),
    } as Event;
  }
  return {
    ...event,
    state: cloneTamabuddyState(event.state),
  } as Event;
}
