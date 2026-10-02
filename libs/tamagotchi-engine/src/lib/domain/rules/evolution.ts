import { CareProfile, StageStats } from '../models/TamagotchiState.js';

export interface EvolutionScore {
  readonly score: number;
  readonly profile: CareProfile;
}

export function scoreEvolution(
  stats: StageStats,
  discipline: number,
): EvolutionScore {
  const carePenalty = Math.min(stats.careMistakes * 2, 6);
  const sicknessPenalty = Math.min(stats.sicknessEpisodes, 2);
  const dietPenalty = stats.snacks > stats.meals ? 1 : 0;
  const disciplineBonus = discipline >= 3 ? 1 : 0;
  const gameBonus =
    stats.gamesPlayed >= 3 && stats.gamesWon / stats.gamesPlayed >= 0.5 ? 1 : 0;
  const score = Math.max(
    0,
    Math.min(
      10,
      8 -
        carePenalty -
        sicknessPenalty -
        dietPenalty +
        disciplineBonus +
        gameBonus,
    ),
  );

  return {
    score,
    profile: score >= 8 ? 'thriving' : score >= 4 ? 'balanced' : 'struggling',
  };
}
