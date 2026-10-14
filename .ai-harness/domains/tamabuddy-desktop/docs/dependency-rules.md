# Desktop dependency rules

Allowed direction is `app -> features -> entities -> shared`. A lower layer must not import a higher layer. Features do not import another feature's internal files; expose the smallest public contract when cross-feature coordination is necessary.

- UI must not become the authority for Tamabuddy domain eligibility, lifecycle, or persistence invariants.
- Engine/client access belongs behind the owning feature adapter or hook rather than spreading across visual components.
- Browser storage and Tauri APIs stay in adapters. Pure presentation and mapping code must not depend on them.
- Avoid global `components`, `hooks`, `helpers`, or `utils` dumping grounds. Prefer feature ownership or a responsibility-specific shared module.
- Do not add Zustand, TanStack Query, a router, Storybook, or another framework until current React/client mechanisms create a demonstrated limitation.
- Preserve keyboard access, semantic names, focus visibility, reduced-motion support, and readable state feedback during visual changes.

The current ESLint configuration enforces proven boundaries: app composition, presentation features, and entities cannot import the engine or client directly; features cannot import app composition; entities cannot import app or features; and production app/cross-feature imports use the owning feature's `index.ts`. Engine/client access remains allowed only in the pet hook, model translator, service adapter, and focused tests.
