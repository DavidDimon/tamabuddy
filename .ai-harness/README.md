# Tamabuddy AI harness

Project-local guidance for finding the right extension point, preserving architectural boundaries, and reviewing changes. This directory guides decisions; the code and executable tests remain the source of truth for implemented behavior.

## Retrieval order

1. Restate and classify the requested change.
2. Follow [`core/workflows/change-retrieval.md`](core/workflows/change-retrieval.md).
3. For engine work, enter through [`domains/tamabuddy-engine/README.md`](domains/tamabuddy-engine/README.md).
4. For desktop work, enter through [`domains/tamabuddy-desktop/README.md`](domains/tamabuddy-desktop/README.md).
5. For implementation tasks or roadmaps, enter through [`domains/product-delivery/README.md`](domains/product-delivery/README.md).
6. Load only the relevant rule/skill from [`core/skills/index.md`](core/skills/index.md).
7. Confirm assumptions against implementation and tests before editing.

## Map

- `core/rules/`: shared constraints for changes, architecture, tests, and code quality.
- `core/skills/`: task instructions routed by [`core/skills/index.md`](core/skills/index.md).
- `core/workflows/`: retrieval and review-learning sequences.
- `core/templates/`: records whose stable shape improves future retrieval.
- `core/decisions/`: accepted harness-level architecture decisions.
- `domains/tamabuddy-engine/`: engine-specific state, boundaries, and entry workflow.
- `domains/tamabuddy-desktop/`: desktop architecture, visual language, boundaries, and extension points.
- `domains/product-delivery/`: evidence-backed implementation task and roadmap contracts.
- `external/`: pinned upstream skill snapshots with license and provenance; local routing remains in `core/skills/`.
- `adapters/`: thin agent-specific discovery layers; never a second source of rules.
- `reviews/`: how findings become evidence without automatically becoming policy.
- `evaluations/`: manual retrieval cases and protected-content skill fixtures.

## Precedence and conflicts

User requirements define the task. Executable behavior in code/tests outranks stale documentation. Domain rules specialize core rules but must not weaken dependency boundaries or testing conventions. If documents disagree, stop, identify the conflict, and update the relevant source of truth within task scope.

## Current scope

The workspace contains web and native desktop React clients, a shared UI-agnostic client session library, and a pure TypeScript engine library. Tamabuddy behavior v1.0.0 and the deterministic simulation toolchain are implemented. Check each domain's current-state document to distinguish implemented components from approved future extensions.
