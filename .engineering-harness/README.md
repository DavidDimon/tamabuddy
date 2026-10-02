# Tamabuddy engineering harness

Project-local guidance for finding the right extension point, preserving architectural boundaries, and reviewing changes. This directory guides decisions; the code and executable tests remain the source of truth for implemented behavior.

## Retrieval order

1. Restate and classify the requested change.
2. Follow [`core/workflows/change-retrieval.md`](core/workflows/change-retrieval.md).
3. For engine work, enter through [`domains/tamagotchi-engine/README.md`](domains/tamagotchi-engine/README.md).
4. Load only the relevant rule/skill from [`core/skills/index.md`](core/skills/index.md).
5. Confirm assumptions against implementation and tests before editing.

## Map

- `core/rules/`: shared constraints for changes, architecture, tests, and code quality.
- `core/skills/`: task instructions routed by [`core/skills/index.md`](core/skills/index.md).
- `core/workflows/`: retrieval and review-learning sequences.
- `core/templates/`: records whose stable shape improves future retrieval.
- `domains/tamagotchi-engine/`: engine-specific state, boundaries, and entry workflow.
- `adapters/`: thin agent-specific discovery layers; never a second source of rules.
- `reviews/`: how findings become evidence without automatically becoming policy.
- `evaluations/`: manual retrieval cases and protected-content skill fixtures.

## Precedence and conflicts

User requirements define the task. Executable behavior in code/tests outranks stale documentation. Domain rules specialize core rules but must not weaken dependency boundaries or testing conventions. If documents disagree, stop, identify the conflict, and update the relevant source of truth within task scope.

## Current scope

The workspace contains a minimal React app that observes the engine actor through its public API, plus a pure TypeScript engine library. Tamagotchi behavior v1.0.0 is specified but not yet implemented. Check the engine current-state document before treating approved design as code.
