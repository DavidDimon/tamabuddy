export type NeedLevel = 'low' | 'medium' | 'high';

const needLevelByMeter: readonly NeedLevel[] = [
  'high',
  'high',
  'medium',
  'medium',
  'low',
];

export function needLevel(meter: number): NeedLevel {
  const level = needLevelByMeter[meter];
  if (level === undefined) {
    throw new RangeError('Need meters must be integers from 0 to 4');
  }
  return level;
}
