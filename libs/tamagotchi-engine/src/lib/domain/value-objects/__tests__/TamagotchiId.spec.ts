import { TamagotchiId } from '../TamagotchiId.js';

describe('TamagotchiId', () => {
  it('creates a normalized identifier', () => {
    expect(TamagotchiId.create('  pet-1  ').value).toBe('pet-1');
  });

  it('rejects an empty identifier', () => {
    expect(() => TamagotchiId.create('   ')).toThrow(
      'TamagotchiId cannot be empty',
    );
  });
});
