import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';
import {
  minutes,
  scenario,
  type RandomSimulationReplay,
  type SimulationInvariant,
} from '@tamabuddy/tamabuddy-engine/testing';

const invariant: SimulationInvariant = {
  name: 'built-types-consumer',
  checkFinal: ({ state }) =>
    state.health < 0 ? 'health cannot be negative' : undefined,
};

const acceptsReplay: (replay: RandomSimulationReplay) => boolean = () => true;

async function compileRepresentativeScenario(): Promise<void> {
  await scenario('built-types consumer')
    .given(Tamabuddy.create(TamabuddyId.create('types-consumer')))
    .at(minutes(5))
    .expectState({ stage: 'baby' })
    .run();
}

void invariant;
void acceptsReplay;
void compileRepresentativeScenario;
