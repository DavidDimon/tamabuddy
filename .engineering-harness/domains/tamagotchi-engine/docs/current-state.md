# Engine current state

Verified against `libs/tamagotchi-engine` during Stage 08.

## Present

- Nx library `@tamabuddy/tamagotchi-engine`.
- TypeScript strict mode inherited from the workspace.
- TSC build, ESLint, and Vitest targets inferred by Nx plugins.
- Deliberate public API through `src/index.ts` and `src/lib/public-api/index.ts`.
- Snapshot-backed `Tamagotchi` aggregate with schema/range/chronology invariants and validated `TamagotchiId`.
- V1 stage tables and pure rules for actions, decay, illness, attention, evolution, sleep, and death.
- `TamagotchiProcessor` jumps between scheduled boundaries using injected `Clock`; no minute polling.
- XState v5 coordinates internal `egg`, `idle`, `sleeping`, and terminal `dead` transitions.
- `TamagotchiEngine` atomically creates, loads/processes, commands, and saves through repository/Clock ports.
- `InMemoryTamagotchiRepository` stores/restores cloned snapshots; `SystemClock` is the wall-clock adapter.
- Public API exposes domain commands/state and the engine facade, not raw machine events.
- React observes `TamagotchiState` and dispatches commands through `TamagotchiEngineClient`.
- No React import or browser API dependency.
- Local tests cover invariants, actions, decay, offline time, sleep, illness, attention, evolution, death, transitions, and save/load.

## Pending by design

The following are approved concerns for later implementation, not current components:

- strategies, policies, and specifications backed by real variation/criteria;
- durable persistence, concurrency control, legacy save migration, and external-format adapters;
- random game adapters; v1 receives deterministic `win | loss` command input.

The approved behavior source is `docs/domain-model.md` plus its linked documents. Do not create empty files or generic abstractions for pending concerns. Update this map when implementation establishes their real paths and responsibilities.
