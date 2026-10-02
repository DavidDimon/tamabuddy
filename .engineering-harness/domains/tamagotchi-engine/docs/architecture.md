# Engine architecture

## Status

Domain behavior v1.0.0 and the boundaries below are implemented. Check `current-state.md` for remaining infrastructure/variation work.

## Boundaries

```text
React app
  -> package root/public API
    -> application services + engine orchestration
      -> domain entities, values, and pure rules
    <- infrastructure implements application ports
```

- `domain`: pet state and invariants. No framework, storage, or wall clock.
- `application`: use cases and ports. Coordinates domain without concrete infrastructure.
- `engine`: behavioral machine, actor creation, and elapsed-time processors.
- `infrastructure`: system clock and persistence adapters.
- `public-api`: supported package surface. Consumers never deep-import internals.
- React app: owns rendering and subscriptions only.

Detailed constraints: `dependency-rules.md` and `../rules/dependency-boundaries.md`.

## Implemented public API

`src/index.ts` re-exports only `src/lib/public-api/index.ts`. The current surface exports:

- `Tamagotchi`, `TamagotchiId`;
- `Clock`, `TamagotchiRepository`;
- `LoadTamagotchi`, `ElapsedTimeProcessor`, `ElapsedTimeWindow`;
- `TamagotchiEngine`, `EngineCommandResult`, `TamagotchiCommand`, `ActionRejection`, `TamagotchiState`, and consumer-relevant domain types;
- `SystemClock`, `InMemoryTamagotchiRepository`.

Review this barrel for every addition. Export a type only when consumers need it. Internal rules and helpers stay private.

## Implemented command flow

```text
command at T
  -> process elapsed boundaries through T
  -> validate action against post-elapsed domain state
  -> apply pure rules/entity invariant changes
  -> coordinate behavioral transition when needed
  -> persist aggregate atomically
  -> publish typed outcome + aggregate snapshot
  -> React subscription renders snapshot
```

Scheduled events use the same processor/rule/transition path. The exact tie order comes from `time-model.md`.

## State ownership

- Aggregate: identity, lifecycle data, needs, illness, care history, attention, and schedules.
- XState: durable behavior only (`egg`, `idle`, `sleeping`, `dead`).
- Processor: chronological coordination; formulas remain pure domain rules.
- Repository: aggregate load/save, not care decisions.
- React: no authoritative pet state and no domain calculations.

The web app follows this boundary through `TamagotchiEngineClient` and `useSyncExternalStore`. It imports `@tamabuddy/tamagotchi-engine`, dispatches domain commands, and cannot send raw machine events.
