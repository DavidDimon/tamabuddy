# Engine testing

## Placement and names

```text
EntityOrArea/
├── Implementation.ts
├── __tests__/
│   └── Implementation.spec.ts
└── __mocks__/
    └── Implementation.mock.ts
```

- Tests: `*.spec.ts` or `*.spec.tsx`; never `*.test.ts`/`*.test.tsx`.
- Mocks: `*.mock.ts`/`*.mock.tsx`, named by entity or area.
- Keep tests and mocks beside their implementation area. No global engine mock folder.
- Prefer real values, small factories, or builders for valid aggregate setup. Mock only ports, nondeterministic sources, or expensive collaborators.
- A builder creates readable valid state with targeted overrides. It is better than a mock that imitates domain behavior.

## Expected coverage

| Area                       | Test focus                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Domain/entity/value object | creation, normalization, invariants, ranges, invalid inputs, atomic changes             |
| Processor                  | event order, simultaneous boundaries, long offline interval, early death, injected time |
| Policy                     | named decision truth table and boundary cases                                           |
| Specification              | each criterion plus `and`/`or`/`not` composition actually used                          |
| Strategy                   | shared contract tests for each real interchangeable algorithm                           |
| State machine              | initial state, allowed/rejected transitions, guards, terminal behavior, snapshots       |
| Elapsed/offline            | equal input replay, sleep pauses, illness continuity, no cap, backward-time rejection   |
| Repository/Adapter         | contract behavior, round-trip, missing record, schema validation, migration failures    |

Policies, Specifications, and Strategies do not exist yet. Add their test categories only when the corresponding abstraction has evidence.

## Test levels

- Pure unit tests own formulas and invariants.
- Processor/machine tests own orchestration and transition order.
- Repository contract tests may run against every adapter.
- Public API/client tests verify integration without deep imports.
- React tests assert rendering/dispatch, never re-test domain formulas.

Use fake time through `Clock`; do not wait on real timers. Test observable outcomes, not private call order unless order is the rule under test.
