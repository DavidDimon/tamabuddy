# State machine

## Implemented

`engine/machine/tamagotchiMachine.ts` uses XState v5 `setup(...)` with empty context and durable `egg`, `idle`, `sleeping`, and final `dead` states. Events are `HATCH`, `SLEEP`, `WAKE`, and `DIE`.

`TamagotchiProcessor` requests transitions through `transitionTamagotchiBehavior`; persisted behavior is copied from the resulting snapshot. Machine events/helpers stay internal. React dispatches domain commands through `TamagotchiEngine`.

## V1 ownership

The machine will own durable behaviors:

```text
egg -> idle <-> sleeping
[egg | idle | sleeping] -> dead
```

- `egg`: waits for automatic hatch.
- `idle`: accepts conditionally valid care commands.
- `sleeping`: rejects care commands until automatic wake.
- `dead`: terminal.

Illness is aggregate condition, not machine state. Eating, playing, cleaning, medicine, and discipline are atomic actions, not durable states. Numeric meters and time arithmetic stay outside machine configuration.

## Transition rules

- Processor applies elapsed rules before a command transition.
- Pure domain guards decide eligibility; guards must not read wall time or storage.
- Death wins ties and enters terminal `dead`.
- Evolution changes aggregate stage, not necessarily behavioral state.
- Snapshots expose consumer-safe behavior/outcomes; React must not inspect internal machine implementation.

Update `decisions/001-xstate-v5.md`, transition tests, domain state, and consumer snapshot types when machine ownership changes.
