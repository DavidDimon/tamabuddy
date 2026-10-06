---
name: implement-domain-rule
description: Implement or change a formalized Tamabuddy need, action, lifecycle, attention, evolution, illness, or invariant while keeping one documented owner.
---

# Implement a domain rule

1. Read `../../../domains/tamabuddy-engine/rules/domain-behavior-consistency.md`.
2. Read `domain-model.md`, `invariants.md`, and the owning behavior document.
3. Locate existing code/tests; do not assume the approved v1 design is already implemented.
4. Prefer entity/value ownership or a pure function. Use `evaluate-pattern-choice` only when a real abstraction decision remains.
5. Update focused boundary/tie tests and the owning document when semantics change.
6. Review persistence/public API impact and deterministic replay.

Do not duplicate constants in machine, React, infrastructure, or tests. Do not change undocumented behavior silently.
