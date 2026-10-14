# Product delivery harness

Entry point for turning Tamabuddy requests into implementation tasks or roadmaps. This domain structures planning output; it does not invent product requirements or authorize implementation.

## Retrieval

1. Read [`docs/task-contract.md`](docs/task-contract.md) for one implementation-ready unit of work.
2. Read [`docs/roadmap-contract.md`](docs/roadmap-contract.md) for multiple dependent outcomes or milestones.
3. Inspect the owning code/domain and existing decisions before naming extension points or estimates.
4. Load `create-implementation-task` or `build-roadmap` from the core skill index, not both unless the request needs both artifacts.

Tasks and roadmaps must distinguish verified current state, proposed decisions, assumptions, and unresolved choices.

## Proposed roadmaps

- [`roadmaps/agent-token-efficiency.md`](roadmaps/agent-token-efficiency.md): reduce agent context/tool-output cost and evaluate Jev behind measurable adoption criteria.
