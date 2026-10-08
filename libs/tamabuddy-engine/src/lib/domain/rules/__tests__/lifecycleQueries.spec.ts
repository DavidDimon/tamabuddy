import { Tamabuddy } from '../../entities/Tamabuddy.js';
import { TamabuddyId } from '../../value-objects/TamabuddyId.js';
import { getHatchDeadline } from '../lifecycleQueries.js';

describe('getHatchDeadline', () => {
  it('returns the automatic hatch boundary for an egg', () => {
    const egg = Tamabuddy.create(
      TamabuddyId.create('countdown-pet'),
      100,
    ).snapshot();

    expect(getHatchDeadline(egg)).toBe(300_100);
  });

  it('returns no deadline after the egg stage', () => {
    expect(
      getHatchDeadline({ stage: 'baby', stageStartedAt: 300_100 }),
    ).toBeNull();
  });
});
