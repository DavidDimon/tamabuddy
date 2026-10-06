import {
  createTamabuddyActor,
  transitionTamabuddyBehavior,
} from '../createTamabuddyActor.js';

describe('tamabuddyMachine', () => {
  it('starts as an egg without owning numeric domain attributes', () => {
    const actor = createTamabuddyActor();
    actor.start();

    expect(actor.getSnapshot().matches('egg')).toBe(true);
    expect(actor.getSnapshot().context).toEqual({});

    actor.stop();
  });

  it('coordinates durable lifecycle transitions', () => {
    expect(transitionTamabuddyBehavior('egg', { type: 'HATCH' })).toBe('idle');
    expect(transitionTamabuddyBehavior('idle', { type: 'SLEEP' })).toBe(
      'sleeping',
    );
    expect(transitionTamabuddyBehavior('sleeping', { type: 'WAKE' })).toBe(
      'idle',
    );
    expect(transitionTamabuddyBehavior('sleeping', { type: 'DIE' })).toBe(
      'dead',
    );
  });

  it('rejects behaviorally invalid transitions', () => {
    expect(transitionTamabuddyBehavior('egg', { type: 'SLEEP' })).toBe('egg');
    expect(transitionTamabuddyBehavior('dead', { type: 'WAKE' })).toBe('dead');
  });
});
