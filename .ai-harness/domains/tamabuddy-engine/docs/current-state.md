# Engine current state

Verified against `libs/tamabuddy-engine` during Stage 08.

## Present

- Nx library `@tamabuddy/tamabuddy-engine`.
- TypeScript strict mode inherited from the workspace.
- TSC build, ESLint, and Vitest targets inferred by Nx plugins.
- Deliberate public API through `src/index.ts` and `src/lib/public-api/index.ts`.
- Snapshot-backed `Tamabuddy` aggregate with schema/range/chronology invariants and validated `TamabuddyId`.
- V1 stage tables and pure rules for actions, decay, illness, attention, evolution, sleep, and death.
- `TamabuddyProcessor` jumps between scheduled boundaries using injected `Clock`; no minute polling.
- `TamabuddyProcessor` can return cloned before/after snapshots for every effective automatic boundary and a separate command observation; legacy processing delegates to the same traced path.
- The supported `@tamabuddy/tamabuddy-engine/testing` subpath exposes validated durations, deterministic command runs, semantic life events, queryable timelines, the Scenario DSL, simulated-owner strategies, seeded replay, and bounded batch invariant campaigns without entering the package root API. Trace mechanics, arbitrary-state builders, virtual-clock implementation, raw random sources, and normalization helpers remain internal.
- XState v5 coordinates internal `egg`, `idle`, `sleeping`, and terminal `dead` transitions.
- `TamabuddyEngine` atomically creates, loads/processes, commands, and saves through repository/Clock ports.
- `InMemoryTamabuddyRepository` stores/restores cloned snapshots; `SystemClock` is the wall-clock adapter.
- Public API exposes domain commands/state and the engine facade, not raw machine events.
- React observes `TamabuddyState` and dispatches commands through `TamabuddyEngineClient`.
- The web app's development composition exposes Life Lab for bounded single-life and batch runs, timeline/event inspection, state-series charts, replay copy/rerun, and safe egg/baby presets. A build-resolved virtual module replaces the complete feature with a null stub in production, and an explicit target verifies its marker is absent from JavaScript, CSS, and HTML artifacts.
- No React import or browser API dependency.
- Local tests cover invariants, actions, decay, offline time, sleep, illness, attention, evolution, death, transitions, save/load, deterministic life simulation, readable scenario assertions, shared simulated-owner contracts, seeded variation, exact replay, deterministic batch ordering, replayable invariant failures, and Life Lab configuration/gating/inspection/error states.

## Pending by design

The following are approved concerns for later implementation, not current components:

- domain strategies, policies, and specifications backed by real variation/criteria;
- durable persistence, concurrency control, legacy save migration, and external-format adapters;
- random game adapters; v1 receives deterministic `win | loss` command input.

The approved behavior source is `docs/domain-model.md` plus its linked documents. Do not create empty files or generic abstractions for pending concerns. Update this map when implementation establishes their real paths and responsibilities.
