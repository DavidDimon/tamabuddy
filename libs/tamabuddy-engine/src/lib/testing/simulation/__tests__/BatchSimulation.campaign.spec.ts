import { hours } from '../durations.js';
import { BatchSimulationRunner } from '../BatchSimulationRunner.js';
import { randomOwner } from '../strategies/randomOwner.js';
import { TamabuddyBuilder } from '../../../engine/processors/__mocks__/TamabuddyBuilder.mock.js';

const campaign =
  process.env['TAMABUDDY_LONG_CAMPAIGN'] === 'true' ? describe : describe.skip;

campaign('long seeded-life campaign', () => {
  it('preserves structural invariants across 100 six-hour lives', async () => {
    const summary = await new BatchSimulationRunner().run({
      initial: TamabuddyBuilder.hatched('baby').build(),
      seeds: { from: 0, to: 99 },
      until: hours(6),
      strategyFactory: (seed) => randomOwner(seed),
      maximumConcurrency: 8,
      maximumRuns: 100,
      failureMode: 'collect-all',
    });

    expect(summary.failures).toEqual([]);
    expect(summary.completedRuns).toBe(100);
  });
});
