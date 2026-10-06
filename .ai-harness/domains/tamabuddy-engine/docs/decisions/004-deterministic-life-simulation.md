# Decision 004: Deterministic life simulation is an observational testing layer

## Status

Accepted after implementation of the life simulator, Scenario DSL, owner strategies, replay, batch invariants, supported testing entrypoint, and developer Life Lab.

## Context

Engine tests and balance analysis need to explain complete lives across long time spans. Reimplementing schedules or care formulas in test helpers would create a second behavioral model, while wall-clock tests and minute polling would be slow and incomplete. Randomized owner behavior also needs exact reproduction from bug reports.

## Decision

Keep deterministic life simulation under `testing/simulation` as an observational layer over the real `TamabuddyEngine`, traced processor, virtual clock, and in-memory repository.

- Processor tracing is additive: it records ordered boundary timestamps and independent before/after snapshots without exposing the boundary algorithm, persisting trace data, or changing `process()` behavior.
- The life runner accepts valid initial state and existing commands, advances directly between scheduled boundaries, records command acceptance/rejection, and derives semantic events from observed state transitions. Events never drive domain behavior.
- Timeline time is relative to the initial state's `lastProcessedAt`. Equal-time commands retain declaration order, automatic effects at `T` precede commands at `T`, and processing stops at death.
- The Scenario DSL uses absolute `at()` and relative `wait()` cursors. Exact state assertions remain canonical; semantic need levels are a documented testing vocabulary, not new domain state.
- Simulated owners inspect public timeline/state observations and only propose existing commands at explicit monotonic times. They live outside the domain because they model external actors, not pet rules.
- Random owners use a simulation-owned, versioned seeded PRNG. A replay descriptor captures initial state, duration, seed, PRNG version, normalized strategy configuration, and generated commands. Changing the PRNG is a replay-compatibility change.
- Batch campaigns enumerate explicit seeds deterministically, bound run count and concurrency, and report replayable failures with bounded command/event tails. Successful runs do not retain full timelines by default.
- Stable consumer support is exported only from `@tamabuddy/tamabuddy-engine/testing`; trace internals, arbitrary-state builders, the virtual clock, raw random sources, and configuration normalization remain internal. The package root stays production-only.
- Life Lab is a development-only React consumer. It maps controls to the testing API and renders observed metadata, states, events, outcomes, and pure timeline-derived chart series. It is limited to 30 simulated days, 100 batch seeds, and four concurrent runs. Production composition resolves it to a null module and verifies that its code and CSS marker are absent from emitted artifacts.

## Semantic event vocabulary

The supported observational vocabulary is `hatched`, `sick`, `cured`, `evolved`, `sleeping`, `woke`, `care-mistake`, `died`, and `command`. Command events include acceptance or rejection. Adding events requires an observed engine transition and exhaustive derivation tests; it must not introduce a parallel event-driven domain model.

## Consequences

- Long simulations remain fast because time jumps to real engine boundaries rather than polling.
- Tests and tools cannot calculate hidden schedules or duplicate decay, illness, attention, evolution, sleep, or death formulas.
- Same inputs and replay metadata must produce deeply equal timelines.
- Trace parity, boundary ordering, snapshot independence, invalid input, post-death behavior, owner contracts, PRNG vectors, replay, batch ordering, consumer entrypoints, and production exclusion remain required regression coverage.
- The implemented contracts live in `architecture.md`, `processors.md`, `strategies.md`, and `testing.md`; completed implementation task files are intentionally not retained as permanent documentation.
