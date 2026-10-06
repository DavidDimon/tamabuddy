# Engine change review workflow

After an engine change:

1. Compare behavior with owning domain docs and invariants.
2. Check dependency direction and public API; reject deep-import bypasses.
3. Search for duplicated rules/constants and direct clock/storage access.
4. Confirm XState owns behavior only and processors own coordination only.
5. Confirm React contains no domain decision.
6. Audit nearby tests/mocks: local placement, `*.spec.ts[x]`, `*.mock.ts[x]`, relevant boundaries.
7. Apply `review-code-smells` to touched code.
8. Check architecture/domain docs and ADRs for drift.
9. Run focused tests, typecheck, lint, build, formatting, and `nx sync:check` in proportion to risk.

Report findings by impact with evidence and smallest safe fix. Do not hide an unresolved conflict behind a documentation-only change.
