import { Tamagotchi } from '../Tamagotchi.js';
import { TamagotchiId } from '../../value-objects/TamagotchiId.js';

describe('Tamagotchi', () => {
  it('creates a valid persisted egg snapshot', () => {
    const state = Tamagotchi.create(
      TamagotchiId.create('pet-1'),
      100,
    ).snapshot();

    expect(state).toMatchObject({
      schemaVersion: 1,
      id: 'pet-1',
      stage: 'egg',
      behavior: 'egg',
      createdAt: 100,
      lastProcessedAt: 100,
      weight: 0,
    });
  });

  it('protects the aggregate from snapshot mutation', () => {
    const tamagotchi = Tamagotchi.create(TamagotchiId.create('pet-1'));
    const snapshot = tamagotchi.snapshot();

    Object.assign(snapshot.stageStats, { meals: 10 });

    expect(tamagotchi.snapshot().stageStats.meals).toBe(0);
  });

  it('rejects invalid restored invariants', () => {
    const state = Tamagotchi.create(TamagotchiId.create('pet-1')).snapshot();

    expect(() => Tamagotchi.restore({ ...state, hunger: 5 })).toThrow(
      'hunger must be an integer from 0 to 4',
    );
    expect(() => Tamagotchi.restore({ ...state, behavior: 'idle' })).toThrow(
      'Egg stage, behavior, and hatch time must agree',
    );
    expect(() => Tamagotchi.restore({ ...state, weight: 1 })).toThrow(
      'Egg weight must be 0',
    );
    expect(() =>
      Tamagotchi.restore({
        ...state,
        stageStats: { ...state.stageStats, gamesPlayed: 1, gamesWon: 2 },
      }),
    ).toThrow('Stage game wins cannot exceed games played');
    expect(() =>
      Tamagotchi.restore({
        ...state,
        lastProcessedAt: 10,
        schedules: { ...state.schedules, nextHungerAt: 9 },
      }),
    ).toThrow('Schedules cannot precede lastProcessedAt');
  });
});
