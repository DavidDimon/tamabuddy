import {
  createTamagotchiActor,
  transitionTamagotchiBehavior,
} from '../createTamagotchiActor.js';

describe('tamagotchiMachine', () => {
  it('starts as an egg without owning numeric domain attributes', () => {
    const actor = createTamagotchiActor();
    actor.start();

    expect(actor.getSnapshot().matches('egg')).toBe(true);
    expect(actor.getSnapshot().context).toEqual({});

    actor.stop();
  });

  it('coordinates durable lifecycle transitions', () => {
    expect(transitionTamagotchiBehavior('egg', { type: 'HATCH' })).toBe('idle');
    expect(transitionTamagotchiBehavior('idle', { type: 'SLEEP' })).toBe(
      'sleeping',
    );
    expect(transitionTamagotchiBehavior('sleeping', { type: 'WAKE' })).toBe(
      'idle',
    );
    expect(transitionTamagotchiBehavior('sleeping', { type: 'DIE' })).toBe(
      'dead',
    );
  });

  it('rejects behaviorally invalid transitions', () => {
    expect(transitionTamagotchiBehavior('egg', { type: 'SLEEP' })).toBe('egg');
    expect(transitionTamagotchiBehavior('dead', { type: 'WAKE' })).toBe('dead');
  });
});
