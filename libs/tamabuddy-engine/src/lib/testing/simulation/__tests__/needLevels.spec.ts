import { needLevel } from '../needLevels.js';

describe('needLevel', () => {
  it('maps low meters to high needs and full meters to low needs', () => {
    expect([0, 1, 2, 3, 4].map(needLevel)).toEqual([
      'high',
      'high',
      'medium',
      'medium',
      'low',
    ]);
  });

  it.each([-1, 5, 1.5])('rejects invalid meter %s', (meter) => {
    expect(() => needLevel(meter)).toThrow(RangeError);
  });
});
