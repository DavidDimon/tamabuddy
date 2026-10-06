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
- `testing/simulation`: deterministic orchestration, Scenario DSL, simulated-owner strategies, seeded random generation, replay, and batch invariant campaigns over the real processor, engine facade, virtual clock, and in-memory repository.
- `testing/public-api`: curated supported testing surface, published only through the package `./testing` subpath.
- `public-api`: supported package surface. Consumers never deep-import internals.
- React app: owns rendering and subscriptions only.
- Life Lab: a development-only React consumer of the curated testing subpath. Pure UI mapping derives chart points and filters from observed timeline snapshots/events; it does not calculate domain outcomes. Vite resolves its virtual composition module to a null stub for production builds, excluding feature code and CSS.

Detailed constraints: `dependency-rules.md` and `../rules/dependency-boundaries.md`.
The simulator's durable rationale and compatibility decisions are recorded in [`decisions/004-deterministic-life-simulation.md`](decisions/004-deterministic-life-simulation.md).

## Implemented public API

`src/index.ts` re-exports only `src/lib/public-api/index.ts`. The current surface exports:

- `Tamabuddy`, `TamabuddyId`;
- `Clock`, `TamabuddyRepository`;
- `LoadTamabuddy`, `ElapsedTimeProcessor`, `ElapsedTimeWindow`;
- `TamabuddyEngine`, `EngineCommandResult`, `TamabuddyCommand`, `ActionRejection`, `TamabuddyState`, and consumer-relevant domain types;
- `SystemClock`, `InMemoryTamabuddyRepository`.

Review this barrel for every addition. Export a type only when consumers need it. Internal rules and helpers stay private.

The package also publishes `@tamabuddy/tamabuddy-engine/testing` from `src/testing.ts` and `src/lib/testing/public-api/index.ts`. That subpath supports duration helpers, safe egg/baby presets, Scenario, simulation/timeline runners, owner strategies, seeded replay, and batch/invariant contracts. Presets are obtained by observing the real engine lifecycle rather than constructing privileged arbitrary snapshots. The subpath intentionally excludes processor traces, arbitrary-state builders, `VirtualClock`, raw PRNG sources/implementation, normalization helpers, and internal runner composition. These testing symbols remain absent from the package root barrel.

Both entrypoints define source, declaration, ESM import, and default package conditions. The `testing-entrypoint-check` target builds the package, imports the compiled self-referenced subpath, validates its runtime/declaration surface, verifies root isolation, and executes a representative consumer scenario.

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
- Processor: chronological coordination and additive transition observation; formulas remain pure domain rules. Trace snapshots are transient and never enter persisted state.
- Simulation runner: advances a monotonic virtual clock, records processor transitions and engine command outcomes, and derives observational events without driving domain behavior.
- Scenario DSL: builds ordered test plans and evaluates state/event expectations against runner timelines; it owns assertion language and failure context, not Tamabuddy rules.
- Simulated owners: inspect documented timeline/state observations and propose existing commands; the owner runner replays each proposal through the engine and preserves acceptance/rejection in command events.
- Seeded simulation: a versioned simulation-owned random source varies only owner response decisions and delays; replay metadata captures the initial snapshot, duration, seed, PRNG version, normalized owner configuration, and generated command stream.
- Batch simulation: enumerates explicit seeds in stable order, bounds concurrency and run counts, evaluates structural/custom invariants over timeline entries and final snapshots, and returns summaries without retaining successful timelines. Failure reports carry bounded diagnostic tails plus the normal seeded replay descriptor.
- Repository: aggregate load/save, not care decisions.
- React: no authoritative pet state and no domain calculations. Production features use the package root; development/test tooling such as Life Lab may use the supported `/testing` subpath.

The production web app follows this boundary through `TamabuddyEngineClient` and `useSyncExternalStore`. It imports `@tamabuddy/tamabuddy-engine`, dispatches domain commands, and cannot send raw machine events. Its consumer-level integration test imports `/testing` without any deep source path.

The development web composition additionally renders Life Lab. Its controls map directly to `/testing` inputs; result components render metadata, final state, command outcomes, event details, and pure timeline-derived charts. Single runs are limited to 30 days, batches to 100 seeds and four concurrent runs. The `life-lab-production-check` target depends on the production build and rejects any emitted artifact containing the feature marker.
