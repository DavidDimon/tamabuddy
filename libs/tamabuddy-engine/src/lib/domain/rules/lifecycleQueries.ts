import type { TamabuddyState } from '../models/TamabuddyState.js';
import { stageDuration } from './stageRules.js';

export function getHatchDeadline(
  state: Pick<TamabuddyState, 'stage' | 'stageStartedAt'>,
): number | null {
  return state.stage === 'egg'
    ? state.stageStartedAt + stageDuration('egg')
    : null;
}
