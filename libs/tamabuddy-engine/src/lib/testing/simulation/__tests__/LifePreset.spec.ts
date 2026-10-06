import { createLifePreset } from '../LifePreset.js';

describe('createLifePreset', () => {
  it('creates deterministic valid egg and fresh baby snapshots', async () => {
    const egg = await createLifePreset('egg', 'preset-egg');
    const firstBaby = await createLifePreset('baby', 'preset-baby');
    const secondBaby = await createLifePreset('baby', 'preset-baby');

    expect(egg).toMatchObject({
      id: 'preset-egg',
      stage: 'egg',
      behavior: 'egg',
    });
    expect(firstBaby).toMatchObject({
      id: 'preset-baby',
      stage: 'baby',
      behavior: 'idle',
      hatchedAt: firstBaby.lastProcessedAt,
    });
    expect(secondBaby).toEqual(firstBaby);
  });

  it('rejects unsupported presets and invalid ids', async () => {
    await expect(createLifePreset('child' as never)).rejects.toThrow(
      'Unsupported life preset',
    );
    await expect(createLifePreset('egg', '')).rejects.toThrow(
      'TamabuddyId cannot be empty',
    );
  });
});
