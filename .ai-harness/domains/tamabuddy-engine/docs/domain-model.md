# Domain specification v1.1.0

This specification defines the first implementable Tamabuddy ruleset. Tamabuddy is this project's own virtual-pet domain and product identity.

## Aggregate

`Tamabuddy` owns identity, lifecycle, needs, care history, attention, illness, and time-processing cursors. One command changes one aggregate. Repository save is atomic after a successful command or elapsed-time batch.

## Persisted state

- identity/version: `schemaVersion`, `id`;
- lifecycle: `stage`, `behavior`, `createdAt`, `hatchedAt`, `stageStartedAt`, `lastProcessedAt`;
- needs: `hunger`, `happiness`, `discipline`, `health`, `weight`, `poopCount`;
- care: cumulative `careMistakes`, current `stageStats`, `evolutionHistory`, `consecutiveSnacks`;
- illness: cause, start time, medicine doses, next damage time, or `null`;
- attention: active call, per-reason cooldowns, pending discipline call;
- schedules: next hunger/happiness decay, poop, discipline opportunity, sleep, wake, and neglect damage timestamps;
- environment: `lightsOn`.

Persist schedules rather than recomputing from load time. This preserves fractional progress and makes offline processing reproducible.

## Derived state

Never persist values derivable from the saved snapshot plus an evaluation timestamp:

- age and time in current stage;
- full/starving, happy/unhappy, overweight, sick, alive, and time until wake;
- currently valid actions;
- attention indicator visibility;
- evolution score/profile before a transition.

## Types

- `Stage`: `egg | baby | child | teen | adult | elder`.
- `Behavior`: `egg | idle | sleeping | dead`.
- `IllnessCause`: `hygiene | diet | weakness | overweight`.
- `AttentionReason`: `sickness | poop | hunger | happiness | sleep | discipline`.
- `CareProfile`: `thriving | balanced | struggling`.

Illness is a domain condition, not a top-level behavioral state. This avoids a `sick × sleeping` state explosion. Eating and playing are atomic actions, not durable machine states.

## Command outcome

Every command first advances elapsed time to its effective timestamp. A rejected care action has no action effect, but elapsed-time changes remain valid and are persisted atomically with the typed rejection. This prevents a caller from freezing the pet by repeatedly sending invalid actions.

The quick-hatch lifecycle operation is separate from care commands. It first advances elapsed time, transitions a remaining egg through the canonical hatch rule, and reports whether it caused the transition.

## Architectural mapping

| Rule group                  | Preferred mechanism                                                                   | Avoid                                    |
| --------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| Lifecycle/behavior          | XState machine + pure guards                                                          | Numeric needs as machine states          |
| Need decay and elapsed time | Processor + injected `Clock` + pure calculations                                      | Browser timers or scattered `Date.now()` |
| Stage rate lookup           | Typed data/function                                                                   | Strategy classes for numeric constants   |
| Action eligibility          | Pure functions; Policy only if reused across flows                                    | One class per boolean                    |
| Evolution scoring           | Pure scoring function; Specification only if criteria become independently composable | Generic rules engine                     |
| Persistence                 | `TamabuddyRepository` port                                                            | Domain importing storage                 |
| Save migration              | Version-specific Adapter                                                              | Migration logic inside entity            |
| External game result        | Command input                                                                         | Hidden randomness                        |

## Product defaults

Feeding, meal/snack choice, games, medicine, toilet, lights, attention/discipline, health meters, and care-dependent growth are Tamabuddy product concepts. All numeric thresholds, timings, scores, and ordering in v1 are explicit project decisions documented by the linked behavior specifications.
