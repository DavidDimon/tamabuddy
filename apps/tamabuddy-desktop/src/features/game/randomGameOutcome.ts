export type GameOutcome = 'win' | 'loss';

export function randomGameOutcome(): GameOutcome {
  const randomWord = new Uint32Array(1);
  crypto.getRandomValues(randomWord);
  return gameOutcomeFromWord(randomWord[0]);
}

export function gameOutcomeFromWord(randomWord: number): GameOutcome {
  return randomWord % 2 === 0 ? 'win' : 'loss';
}
