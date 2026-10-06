import { cloneTamabuddyState } from '../../domain/models/TamabuddyState.js';
import { TamabuddyProcessingTraceEntry } from '../../engine/processors/TamabuddyProcessingTrace.js';
import {
  CareMistakeLifeEvent,
  CuredLifeEvent,
  DiedLifeEvent,
  EvolvedLifeEvent,
  HatchedLifeEvent,
  LifeEvent,
  SickLifeEvent,
  SleepingLifeEvent,
  StateLifeEvent,
  WokeLifeEvent,
} from './LifeTimeline.js';

export function deriveLifeEvents(
  transition: TamabuddyProcessingTraceEntry,
  origin: number,
): readonly LifeEvent[] {
  const { before, after, at } = transition;
  const offset = at - origin;
  const events: LifeEvent[] = [];
  const base = (): Pick<
    StateLifeEvent,
    'kind' | 'at' | 'offset' | 'state'
  > => ({
    kind: 'event',
    at,
    offset,
    state: cloneTamabuddyState(after),
  });

  if (before.stage === 'egg' && after.stage !== 'egg') {
    events.push({ ...base(), type: 'hatched' } satisfies HatchedLifeEvent);
  }

  if (
    before.behavior === 'sleeping' &&
    after.behavior !== 'sleeping' &&
    after.lightsOn
  ) {
    events.push({ ...base(), type: 'woke' } satisfies WokeLifeEvent);
  }

  const careMistakes = after.careMistakes - before.careMistakes;
  for (let index = 0; index < careMistakes; index += 1) {
    const reason = before.attention?.reason;
    if (reason !== undefined) {
      events.push({
        ...base(),
        type: 'care-mistake',
        reason,
      } satisfies CareMistakeLifeEvent);
    }
  }

  if (
    before.behavior !== 'sleeping' &&
    after.lightsOn === false &&
    (after.behavior === 'sleeping' || after.behavior === 'dead')
  ) {
    events.push({ ...base(), type: 'sleeping' } satisfies SleepingLifeEvent);
  }

  if (before.illness === null && after.illness !== null) {
    events.push({
      ...base(),
      type: 'sick',
      cause: after.illness.cause,
    } satisfies SickLifeEvent);
  }

  if (before.illness !== null && after.illness === null) {
    events.push({
      ...base(),
      type: 'cured',
      cause: before.illness.cause,
    } satisfies CuredLifeEvent);
  }

  if (before.behavior !== 'dead' && after.behavior === 'dead') {
    events.push({ ...base(), type: 'died' } satisfies DiedLifeEvent);
  }

  if (before.stage !== 'egg' && before.stage !== after.stage) {
    const evolution = after.evolutionHistory.at(-1);
    if (evolution !== undefined && evolution.at === at) {
      events.push({
        ...base(),
        type: 'evolved',
        fromStage: evolution.fromStage,
        toStage: evolution.toStage,
        score: evolution.score,
        profile: evolution.profile,
      } satisfies EvolvedLifeEvent);
    }
  }

  return events;
}
