import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import {
  cloneTamabuddyState,
  TamabuddyState,
} from '../../domain/models/TamabuddyState.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';
import { days } from './durations.js';
import { LifeSimulationRunner } from './LifeSimulationRunner.js';

export type LifePreset = 'egg' | 'baby';

const MAXIMUM_PRESET_SEARCH_DURATION = days(1);

export async function createLifePreset(
  preset: LifePreset,
  id = 'simulation-preset',
): Promise<TamabuddyState> {
  const egg = Tamabuddy.create(TamabuddyId.create(id));
  if (preset === 'egg') return egg.snapshot();
  if (preset !== 'baby') {
    throw new RangeError(`Unsupported life preset: ${String(preset)}`);
  }

  const runner = new LifeSimulationRunner();
  for (
    let duration = 1;
    duration <= MAXIMUM_PRESET_SEARCH_DURATION;
    duration *= 2
  ) {
    const timeline = await runner.run({ initial: egg, until: duration });
    const hatched = timeline.events('hatched')[0];
    if (hatched !== undefined) return cloneTamabuddyState(hatched.state);
  }

  throw new Error('Baby preset could not observe a hatch within one day');
}
