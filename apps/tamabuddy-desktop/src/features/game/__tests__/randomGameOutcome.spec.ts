import { gameOutcomeFromWord } from '../randomGameOutcome.js';

describe('gameOutcomeFromWord', () => {
  it('maps random words to both supported engine outcomes', () => {
    expect(gameOutcomeFromWord(2)).toBe('win');
    expect(gameOutcomeFromWord(3)).toBe('loss');
  });
});
