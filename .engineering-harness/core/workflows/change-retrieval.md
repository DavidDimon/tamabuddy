# Change retrieval workflow

1. Restate the requested outcome/exclusions and classify it: UI, application orchestration, domain rule, behavior, adapter, persistence, time, or tooling.
2. For engine work, enter through the domain README and read the owning domain documents.
3. Read `architecture.md` and `extension-points.md`, then only the relevant core rules/skills.
4. Locate the current implementation, public entrypoint, callers, nearby `__tests__`/`__mocks__`, and Nx metadata.
5. List affected invariants, dependency boundaries, tests, exports, persistence, and documentation.
6. Search for the existing decision before adding another path.
7. Choose the smallest clear mechanism with `core/rules/architecture.md`.
8. Only then produce the plan or edit.

If the owning extension point is still ambiguous after inspection, pause implementation and surface the alternatives and their consequences.
