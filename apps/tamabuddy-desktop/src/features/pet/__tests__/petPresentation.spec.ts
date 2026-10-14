import { getPetDay, getStageLabel } from '../petPresentation.js';

describe('pet presentation', () => {
  it.each([
    ['egg', 'ovo'],
    ['baby', 'bebê'],
    ['child', 'criança'],
    ['teen', 'jovem'],
    ['adult', 'adulto'],
    ['elder', 'ancião'],
  ] as const)('labels the %s stage as %s', (stage, label) => {
    expect(getStageLabel(stage)).toBe(label);
  });

  it('counts the creation date as day one', () => {
    expect(getPetDay({ createdAt: 1_000, lastProcessedAt: 1_000 })).toBe(1);
  });

  it('counts complete elapsed days', () => {
    const createdAt = Date.UTC(2026, 9, 14);
    const lastProcessedAt = Date.UTC(2026, 9, 16, 12);

    expect(getPetDay({ createdAt, lastProcessedAt })).toBe(3);
  });
});
