import { Tamabuddy } from '../Tamabuddy.js';
import { TamabuddyId } from '../../value-objects/TamabuddyId.js';

describe('Tamabuddy', () => {
  it('creates a valid persisted egg snapshot', () => {
    const state = Tamabuddy.create(TamabuddyId.create('pet-1'), 100).snapshot();

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
    const tamabuddy = Tamabuddy.create(TamabuddyId.create('pet-1'));
    const snapshot = tamabuddy.snapshot();

    Object.assign(snapshot.stageStats, { meals: 10 });

    expect(tamabuddy.snapshot().stageStats.meals).toBe(0);
  });

  it('rejects invalid restored invariants', () => {
    const state = Tamabuddy.create(TamabuddyId.create('pet-1')).snapshot();

    expect(() => Tamabuddy.restore({ ...state, hunger: 5 })).toThrow(
      'hunger must be an integer from 0 to 4',
    );
    expect(() => Tamabuddy.restore({ ...state, behavior: 'idle' })).toThrow(
      'Egg stage, behavior, and hatch time must agree',
    );
    expect(() => Tamabuddy.restore({ ...state, weight: 1 })).toThrow(
      'Egg weight must be 0',
    );
    expect(() =>
      Tamabuddy.restore({
        ...state,
        stageStats: { ...state.stageStats, gamesPlayed: 1, gamesWon: 2 },
      }),
    ).toThrow('Stage game wins cannot exceed games played');
    expect(() =>
      Tamabuddy.restore({
        ...state,
        lastProcessedAt: 10,
        schedules: { ...state.schedules, nextHungerAt: 9 },
      }),
    ).toThrow('Schedules cannot precede lastProcessedAt');
  });
});
