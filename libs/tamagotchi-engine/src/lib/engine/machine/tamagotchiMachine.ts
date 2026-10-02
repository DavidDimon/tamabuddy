import { setup } from 'xstate';

export const tamagotchiMachine = setup({
  types: {
    context: {} as Record<string, never>,
    events: {} as
      | { type: 'HATCH' }
      | { type: 'SLEEP' }
      | { type: 'WAKE' }
      | { type: 'DIE' },
  },
}).createMachine({
  id: 'tamagotchi',
  context: {},
  initial: 'egg',
  states: {
    egg: {
      on: {
        HATCH: 'idle',
        DIE: 'dead',
      },
    },
    idle: {
      on: {
        SLEEP: 'sleeping',
        DIE: 'dead',
      },
    },
    sleeping: {
      on: {
        WAKE: 'idle',
        DIE: 'dead',
      },
    },
    dead: {
      type: 'final',
    },
  },
});
