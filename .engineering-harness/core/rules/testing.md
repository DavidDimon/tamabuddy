# Testing conventions

Tests and local mocks live next to their implementation area:

```text
area/
├── Entity.ts
├── __tests__/
│   └── Entity.spec.ts
└── __mocks__/
    └── Entity.mock.ts
```

- Use `*.spec.ts` or `*.spec.tsx`; never introduce `*.test.ts` or `*.test.tsx`.
- Keep mocks as `*.mock.ts`/`*.mock.tsx` and identifiable by entity or area.
- Do not create a global engine mock directory. Share a builder only when several tests need the same valid domain object.
- Prefer real values and pure functions over mocks. Mock external boundaries, nondeterministic sources, or expensive collaborators.
- Test observable behavior and invariants, including invalid inputs and boundaries. Avoid tests coupled only to private implementation details.
- Any behavior change updates its tests; formalized domain behavior also updates the owning documentation.
