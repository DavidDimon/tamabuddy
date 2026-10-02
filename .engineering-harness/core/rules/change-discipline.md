# Change discipline

## Before editing

- Inspect the requested surface, nearby tests, public exports, and Nx project metadata.
- Identify the smallest responsible extension point and the invariants it owns.
- Search for an existing rule before adding another implementation of the same decision.
- Separate observed facts from assumptions. Verify assumptions that affect architecture or behavior.

## While editing

- Keep the change inside the requested scope. Do not bundle opportunistic refactors.
- Prefer composition and small pure functions when they express the rule clearly.
- Preserve public API compatibility unless the task explicitly changes it.
- Add an abstraction only when it creates a real boundary, substitution point, or reusable decision.

## Before finishing

- Run affected tests, typecheck, lint, build, and formatting checks in proportion to the change.
- Review dependency direction, duplicated rules, public exports, and documentation drift.
- Report unresolved assumptions or deviations instead of hiding them behind placeholders.
