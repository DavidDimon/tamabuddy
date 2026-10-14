# Change retrieval workflow

1. Restate the requested outcome/exclusions and classify it: UI, application orchestration, domain rule, behavior, adapter, persistence, time, or tooling.
2. For engine work, enter through the domain README and read the owning domain documents.
3. For desktop work, enter through `domains/tamabuddy-desktop/README.md` and read its current state plus the owning architecture topic.
4. For task or roadmap creation, enter through `domains/product-delivery/README.md` and use its output contract.
5. Read `architecture.md` and `extension-points.md`, then only the relevant core rules/skills.
6. Locate the current implementation, public entrypoint, callers, nearby `__tests__`/`__mocks__`, and Nx metadata.
7. List affected invariants, dependency boundaries, tests, exports, persistence, and documentation.
8. Search for the existing decision before adding another path.
9. Choose the smallest clear mechanism with `core/rules/architecture.md`.
10. Only then produce the plan or edit.

If the owning extension point is still ambiguous after inspection, pause implementation and surface the alternatives and their consequences.
