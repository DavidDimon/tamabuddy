import type { TamabuddyState } from '@tamabuddy/tamabuddy-engine';
import type {
  LifeEvent,
  LifeTimeline,
} from '@tamabuddy/tamabuddy-engine/testing';

export type TimelineFilter = 'all' | 'commands' | 'care' | 'lifecycle';

export interface StateSeriesPoint {
  readonly at: number;
  readonly offset: number;
  readonly state: TamabuddyState;
}

export function deriveStateSeries(
  timeline: LifeTimeline,
): readonly StateSeriesPoint[] {
  const points = new Map<number, StateSeriesPoint>();
  const initial = timeline.at(0);
  points.set(0, { at: timeline.origin, offset: 0, state: initial });

  for (const entry of timeline.entries) {
    const state =
      entry.kind === 'snapshot'
        ? entry.after
        : entry.type === 'command'
          ? entry.after
          : entry.state;
    points.set(entry.offset, {
      at: entry.at,
      offset: entry.offset,
      state,
    });
  }

  const final = timeline.finalState;
  const finalOffset = final.lastProcessedAt - timeline.origin;
  points.set(finalOffset, {
    at: final.lastProcessedAt,
    offset: finalOffset,
    state: final,
  });
  return [...points.values()].sort(
    (first, second) => first.offset - second.offset,
  );
}

export function filterTimelineEvents(
  timeline: LifeTimeline,
  filter: TimelineFilter,
): readonly LifeEvent[] {
  const events = timeline.entries.filter(
    (entry): entry is LifeEvent => entry.kind === 'event',
  );
  if (filter === 'all') return events;
  if (filter === 'commands') {
    return events.filter((event) => event.type === 'command');
  }
  if (filter === 'care') {
    return events.filter((event) =>
      ['command', 'care-mistake', 'sick', 'cured'].includes(event.type),
    );
  }
  return events.filter((event) =>
    ['hatched', 'evolved', 'sleeping', 'woke', 'died'].includes(event.type),
  );
}

export function formatOffset(offset: number): string {
  const totalMinutes = Math.floor(offset / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  return [
    days > 0 ? `${days}d` : '',
    hours > 0 ? `${hours}h` : '',
    `${minutes}m`,
  ]
    .filter(Boolean)
    .join(' ');
}
