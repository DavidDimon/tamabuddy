import { TamabuddyId } from '../TamabuddyId.js';

describe('TamabuddyId', () => {
  it('creates a normalized identifier', () => {
    expect(TamabuddyId.create('  pet-1  ').value).toBe('pet-1');
  });

  it('rejects an empty identifier', () => {
    expect(() => TamabuddyId.create('   ')).toThrow(
      'TamabuddyId cannot be empty',
    );
  });
});
