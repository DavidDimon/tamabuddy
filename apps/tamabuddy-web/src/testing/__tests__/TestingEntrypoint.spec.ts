import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';
import {
  minutes,
  scenario,
  type RandomSimulationReplay,
  type SimulationInvariant,
} from '@tamabuddy/tamabuddy-engine/testing';
import * as root from '@tamabuddy/tamabuddy-engine';
import * as testing from '@tamabuddy/tamabuddy-engine/testing';

describe('@tamabuddy/tamabuddy-engine/testing', () => {
  it('runs a representative scenario through source-mode package resolution', async () => {
    const initial = Tamabuddy.create(TamabuddyId.create('consumer-pet'));
    const timeline = await scenario('source-mode consumer')
      .given(initial)
      .at(minutes(5))
      .expectState({ stage: 'baby' })
      .run();

    expect(timeline.finalState.stage).toBe('baby');
  });

  it('exposes supported contracts without leaking internals or root symbols', () => {
    const invariant: SimulationInvariant = {
      name: 'consumer-invariant',
      checkFinal: ({ state }) =>
        state.health < 0 ? 'health cannot be negative' : undefined,
    };
    const acceptsReplay: (replay: RandomSimulationReplay) => boolean = () =>
      true;

    expect(invariant.name).toBe('consumer-invariant');
    expect(acceptsReplay).toBeTypeOf('function');
    expect(testing).toHaveProperty('BatchSimulationRunner');
    expect(testing).not.toHaveProperty('VirtualClock');
    expect(testing).not.toHaveProperty('Mulberry32RandomSource');
    expect(root).not.toHaveProperty('scenario');
    expect(root).not.toHaveProperty('BatchSimulationRunner');
  });
});
