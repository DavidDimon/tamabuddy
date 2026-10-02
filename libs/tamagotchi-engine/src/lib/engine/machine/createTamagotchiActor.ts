import { createActor, type ActorRefFrom, type SnapshotFrom } from 'xstate';

import { Behavior } from '../../domain/models/TamagotchiState.js';
import { tamagotchiMachine } from './tamagotchiMachine.js';

export type TamagotchiActor = ActorRefFrom<typeof tamagotchiMachine>;
export type TamagotchiSnapshot = SnapshotFrom<typeof tamagotchiMachine>;
export type TamagotchiEvent = Parameters<TamagotchiActor['send']>[0];

export function createTamagotchiActor(): TamagotchiActor {
  return createActor(tamagotchiMachine);
}

export function transitionTamagotchiBehavior(
  behavior: Behavior,
  event: TamagotchiEvent,
): Behavior {
  if (behavior === 'dead') return behavior;

  const snapshot = tamagotchiMachine.resolveState({
    context: {},
    value: behavior,
  });
  const actor = createActor(tamagotchiMachine, { snapshot }).start();

  actor.send(event);
  const nextBehavior = actor.getSnapshot().value;
  actor.stop();

  if (typeof nextBehavior !== 'string') {
    throw new TypeError('Tamagotchi behavior must be a string state');
  }

  return nextBehavior as Behavior;
}
