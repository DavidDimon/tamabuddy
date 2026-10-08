# Tamabuddy engine harness

Entry point for changes to `libs/tamabuddy-engine`. Domain behavior v1.1.0 is implemented; documents remain its formal contract.

## Read before changing the engine

1. [`docs/current-state.md`](docs/current-state.md) for implemented facts.
2. [`docs/domain-model.md`](docs/domain-model.md) and the owning behavior document for formal rules:
   - [`docs/lifecycle.md`](docs/lifecycle.md);
   - [`docs/needs-and-decay.md`](docs/needs-and-decay.md);
   - [`docs/actions.md`](docs/actions.md);
   - [`docs/evolution.md`](docs/evolution.md);
   - [`docs/care-mistakes.md`](docs/care-mistakes.md);
   - [`docs/time-model.md`](docs/time-model.md);
   - [`docs/invariants.md`](docs/invariants.md).
3. [`docs/architecture.md`](docs/architecture.md), [`docs/dependency-rules.md`](docs/dependency-rules.md), and [`docs/extension-points.md`](docs/extension-points.md) for placement.
4. The focused architecture document for tests, machine, processors, patterns, persistence, or examples.
5. [`rules/domain-behavior-consistency.md`](rules/domain-behavior-consistency.md) before behavior changes.
6. [`rules/dependency-boundaries.md`](rules/dependency-boundaries.md) for allowed dependency direction.
7. [`workflows/change-entry.md`](workflows/change-entry.md) to classify the change.
8. Relevant ADRs in [`docs/decisions/`](docs/decisions/), including the [deterministic simulation boundary](docs/decisions/004-deterministic-life-simulation.md), and core rules from [`../../core/rules/`](../../core/rules/).

Task skills are routed by [`../../core/skills/index.md`](../../core/skills/index.md). Load only those needed for the change.

Architecture topics: [`testing`](docs/testing.md), [`state machine`](docs/state-machine.md), [`processors`](docs/processors.md), [`strategies`](docs/strategies.md), [`policies/specifications`](docs/policies-and-specifications.md), [`persistence`](docs/persistence.md), and [`examples`](docs/examples.md).

Stage 09 performs final validation. Do not create competing rules outside these documents.
