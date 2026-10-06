import { emptyStageStats } from '../../models/TamabuddyState.js';
import { scoreEvolution } from '../evolution.js';

describe('scoreEvolution', () => {
  it('classifies thriving care at the upper boundary', () => {
    expect(
      scoreEvolution(
        {
          ...emptyStageStats(),
          gamesPlayed: 4,
          gamesWon: 2,
        },
        3,
      ),
    ).toEqual({ score: 10, profile: 'thriving' });
  });

  it('clamps severe care penalties to a struggling score', () => {
    expect(
      scoreEvolution(
        {
          ...emptyStageStats(),
          careMistakes: 10,
          sicknessEpisodes: 10,
          snacks: 2,
        },
        0,
      ),
    ).toEqual({ score: 0, profile: 'struggling' });
  });
});
