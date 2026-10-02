# Domain invariants — specification v1.0.0

## State

- Need meters are integers `0..4`; poop `0..3`; weight is `0` for egg and `1..99` otherwise.
- `stage=egg` iff `behavior=egg` and `hatchedAt=null`.
- `behavior=sleeping` requires a non-null future `wakeAt` and `lightsOn=false`.
- `behavior=dead` is terminal; health `0` always implies dead.
- At most one illness and one attention call exist.
- Illness dose is `0` or `1`; a successful second dose cures instead of persisting dose `2`.
- Active attention deadline is after open time; cooldowns and next schedules never precede `lastProcessedAt` after processing.
- Evolution history is chronological and stage transitions never move backward.

## Commands

- Process elapsed time before validating a command.
- A rejected care action has no action effect or action domain event; elapsed-time effects processed before rejection remain valid.
- A successful command preserves all ranges and updates `lastProcessedAt` to its timestamp.
- Repository save follows successful processing; partial state is never exposed as committed.

## Ownership

- Domain owns needs, lifecycle, illness, attention, evolution, and action effects.
- XState owns durable behavioral transitions only.
- Processors coordinate elapsed events; they do not duplicate formulas owned by pure domain rules.
- React displays snapshots and sends commands; it owns no domain rule.
- Infrastructure supplies Clock/persistence and cannot decide care outcomes.

## Required tests

Cover every range edge, invalid action/state pair, simultaneous boundary order, long offline interval, illness/death tie, evolution threshold, attention deadline, sleep pause, repository round-trip, and deterministic replay.
