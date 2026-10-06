# Engine testing

## Placement and names

```text
EntityOrArea/
├── Implementation.ts
├── __tests__/
│   └── Implementation.spec.ts
└── __mocks__/
    └── Implementation.mock.ts
```

- Tests: `*.spec.ts` or `*.spec.tsx`; never `*.test.ts`/`*.test.tsx`.
- Mocks: `*.mock.ts`/`*.mock.tsx`, named by entity or area.
- Keep tests and mocks beside their implementation area. No global engine mock folder.
- Prefer real values, small factories, or builders for valid aggregate setup. Mock only ports, nondeterministic sources, or expensive collaborators.
- A builder creates readable valid state with targeted overrides. It is better than a mock that imitates domain behavior.

## Expected coverage

| Area                       | Test focus                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Domain/entity/value object | creation, normalization, invariants, ranges, invalid inputs, atomic changes             |
| Processor                  | event order, simultaneous boundaries, long offline interval, early death, injected time |
| Policy                     | named decision truth table and boundary cases                                           |
| Specification              | each criterion plus `and`/`or`/`not` composition actually used                          |
| Strategy                   | shared contract tests for each real interchangeable algorithm                           |
| State machine              | initial state, allowed/rejected transitions, guards, terminal behavior, snapshots       |
| Elapsed/offline            | equal input replay, sleep pauses, illness continuity, no cap, backward-time rejection   |
| Repository/Adapter         | contract behavior, round-trip, missing record, schema validation, migration failures    |
| Life simulation            | monotonic plans, command order/outcomes, intermediate events, timeline queries, replay  |
| Scenario DSL               | absolute/relative cursors, fluent actions, state/event assertions, diagnostic failures  |

Domain Policies, Specifications, and Strategies do not exist yet. Simulated-owner strategies are established under `testing/simulation/strategies`; add domain pattern tests only when a domain abstraction has evidence.

## Test levels

- Pure unit tests own formulas and invariants.
- Processor/machine tests own orchestration and transition order.
- Repository contract tests may run against every adapter.
- Public API/client tests verify integration without deep imports.
- React tests assert rendering/dispatch, never re-test domain formulas.

Use fake time through `Clock`; do not wait on real timers. Test observable outcomes, not private call order unless order is the rule under test.

Traced processor tests also require parity with legacy final snapshots, ordered intermediate boundaries, exact death termination, empty no-change traces, command-at-boundary separation, and snapshot independence.

Simulation tests use the internal `testing/simulation` entrypoint and real engine rules with virtual time. They must cover equal-time command ordering, exact and between-boundary queries, deterministic replay, invalid durations/regressions, and explicit post-death behavior. They do not duplicate schedule formulas.

## Scenario DSL

`scenario(name)` builds an immutable plan. `at(duration)` sets an absolute offset from the initial state's `lastProcessedAt`; `wait(duration)` advances relative to the current cursor. `feed()`, `snack()`, `play()`, `clean()`, `giveMedicine()`, `discipline()`, and `turnLightsOff()` schedule existing engine commands, and every scheduled care command requires acceptance. Expectations declared between commands at the same timestamp observe only the preceding commands.

`expectState()` matches the exact values of the supplied state fields. `expect()` owns the readable need vocabulary through one mapping in `testing/simulation/needLevels.ts`:

| Domain meter | Semantic need |
| ------------ | ------------- |
| `0..1`       | `high`        |
| `2..3`       | `medium`      |
| `4`          | `low`         |

Both hunger and happiness words describe the need, so `needs.happiness: 'high'` means a low happiness meter. `expectEvent()` and `expectNoEvent()` search cumulative events from scenario origin through the current cursor and may match a partial payload. Scenario failures include the scenario name, absolute time, relative offset, expected/actual data, and recent timeline entries without depending on Vitest internals.

## Simulated-owner strategies

Every `OwnerStrategy` implementation runs through one shared contract: deterministic output for deterministic observations, monotonic explicit proposal times, valid existing command shapes, and no post-death proposals. Focused tests additionally verify perfect-owner responses, neglectful expiration, custom configuration validation, and observable engine rejection. Strategies inspect timeline snapshots/events; tests must not copy attention or action formulas into strategy expectations.

Seeded simulation tests lock the PRNG version with a representative output vector, compare complete same-seed timelines and command streams, use fixed representative seeds to prove variation, and replay the recorded descriptor. Invalid seeds, probabilities, delay ranges, altered command metadata, unsupported PRNG versions, duration limits, and death remain explicit cases. Tests never use probabilistic assertions.

## Batch invariant campaigns

`BatchSimulationRunner` accepts an explicit seed list or inclusive range, a seeded-owner strategy factory, duration, maximum concurrency, and optional run/tail limits. It processes fixed-size chunks so result and failure ordering follow seed selection even if individual runs finish out of order. `stop-early` stops after the already-started chunk and retains every failure in that chunk; `collect-all` visits the complete selection.

The built-in `structural-state` invariant restores every entry snapshot and final snapshot through the aggregate's documented validation boundary. Custom invariants receive public timeline entries/state and return a diagnostic message or nothing; thrown checks become diagnostic failures rather than disappearing. Only the first violation per seed is reported. Each report includes seed, normalized strategy configuration, timestamp/offset, bounded command and event tails, snapshot, and a descriptor accepted by `replayRandomSimulation()`.

Successful campaigns return counts and completed seeds, not full timelines. The normal suite covers small deterministic batches. The opt-in `batch-invariants` Nx target runs the separate 100-seed, six-hour structural campaign by setting `TAMABUDDY_LONG_CAMPAIGN=true`.

## Supported testing entrypoint

Workspace and package consumers import stable simulation support from `@tamabuddy/tamabuddy-engine/testing`, never from `src/lib/**`. Supported values and their related public types are:

- `minutes`, `hours`, and `days`;
- `createLifePreset` and its safe `egg | baby` preset type;
- `scenario`, `Scenario`, `ScenarioFailure`, and scenario expectation types;
- `LifeSimulationRunner`, `LifeTimeline`, and documented plan/entry/event types;
- `OwnerSimulationRunner`, the owner strategy contract, and perfect/neglectful/custom/random owners;
- seeded run/replay functions, replay metadata, configuration types, and `SEEDED_RANDOM_VERSION`;
- `BatchSimulationRunner`, the structural invariant, and batch/invariant contracts.

`VirtualClock`, raw `RandomSource`/Mulberry32 implementation, configuration normalizers, `runRandomOwnerSimulation`, trace types, and test builders remain internal. The subpath has no Vitest runtime dependency. Production code continues to import the unchanged package root.

```ts
import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';
import { minutes, scenario } from '@tamabuddy/tamabuddy-engine/testing';

await scenario('consumer example')
  .given(Tamabuddy.create(TamabuddyId.create('pet-1')))
  .at(minutes(5))
  .expectState({ stage: 'baby' })
  .run();
```

The web app owns the source-mode consumer integration test. The engine's `testing-entrypoint-check` target verifies built-package resolution, declarations, root isolation, and the same representative scenario after `build`.

## Developer Life Lab

Life Lab is a dev-only consumer test surface in `apps/tamabuddy-web`. Its React tests exercise visibility gating, configuration dispatch, loading and validation failures, timeline filtering/detail expansion, replay copying and exact reruns, and failed batch invariants. These assertions inspect rendered observations and descriptors; domain formulas remain covered by engine tests.

Production builds resolve `virtual:life-lab` to a null implementation, so neither its TypeScript graph nor feature CSS is emitted. Run the app's `life-lab-production-check` target after changing its composition or Vite configuration; it builds first and scans JavaScript, CSS, and HTML artifacts for the feature marker.
