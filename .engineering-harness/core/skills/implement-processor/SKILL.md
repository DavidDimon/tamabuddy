---
name: implement-processor
description: Implement engine coordination for elapsed time or events spanning multiple domain transformations with deterministic ordering and injected dependencies.
---

# Implement a processor

Read `../../../domains/tamagotchi-engine/docs/processors.md`, `time-model.md`, `invariants.md`, and `decisions/002-clock-abstraction.md`. Inspect the current processor, `Clock` port, fake clock, and tests.

Processors own chronology and coordination, not formulas. Jump between scheduled boundaries; do not poll per minute. Call pure rules, request machine transitions when needed, stop at death, and return an atomic outcome. Never read `Date.now()`, storage, React state, or hidden randomness. Test simultaneous boundaries, long offline spans, backward time, sleep pauses, death, and deterministic replay.
