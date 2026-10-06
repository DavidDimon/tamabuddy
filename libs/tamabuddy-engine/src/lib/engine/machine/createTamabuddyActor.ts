import { createActor, type ActorRefFrom, type SnapshotFrom } from 'xstate';

import { Behavior } from '../../domain/models/TamabuddyState.js';
import { tamabuddyMachine } from './tamabuddyMachine.js';

export type TamabuddyActor = ActorRefFrom<typeof tamabuddyMachine>;
export type TamabuddySnapshot = SnapshotFrom<typeof tamabuddyMachine>;
export type TamabuddyEvent = Parameters<TamabuddyActor['send']>[0];

export function createTamabuddyActor(): TamabuddyActor {
  return createActor(tamabuddyMachine);
}

export function transitionTamabuddyBehavior(
  behavior: Behavior,
  event: TamabuddyEvent,
): Behavior {
  if (behavior === 'dead') return behavior;

  const snapshot = tamabuddyMachine.resolveState({
    context: {},
    value: behavior,
  });
  const actor = createActor(tamabuddyMachine, { snapshot }).start();

  actor.send(event);
  const nextBehavior = actor.getSnapshot().value;
  actor.stop();

  if (typeof nextBehavior !== 'string') {
    throw new TypeError('Tamabuddy behavior must be a string state');
  }

  return nextBehavior as Behavior;
}
