# Decision 001: XState v5 for behavioral states

## Status

Accepted during Engine Architecture Stage 03.

## Decision

Use XState v5 for behavioral state coordination. Define machines with `setup(...)` for TypeScript inference. Keep numeric attributes, decay calculations, persistence, and time arithmetic outside machine configuration.

The implemented machine contains `egg`, `idle`, `sleeping`, and final `dead`. Illness is an aggregate condition; eating, playing, cleaning, medicine, and discipline are atomic actions, not machine states. Raw events remain internal so consumers cannot bypass domain rules.

## Why

- The product requires explicit behavioral states and guarded transitions.
- XState provides deterministic transition logic, actor snapshots, and strong TypeScript support.
- The machine can stay framework-independent; React is a consumer, not an engine dependency.
- Keeping calculations in processors/domain rules prevents the machine from becoming a God Object.

## Consequences

- `xstate` is a runtime dependency of `@tamabuddy/tamagotchi-engine`.
- Tests create actors without React or browser APIs.
- New states and transitions require domain-rule evidence and focused transition tests.

## References

- [XState v5 setup API](https://stately.ai/docs/setup)
- [XState TypeScript guidance](https://stately.ai/docs/typescript)
