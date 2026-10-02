---
name: write-engine-tests
description: Add or revise Tamagotchi engine tests, local mocks, fakes, factories, or builders using the repository's placement and suffix conventions.
---

# Write engine tests

Read `../../rules/testing.md` and `../../../domains/tamagotchi-engine/docs/testing.md`. Inspect the implementation and adjacent tests before choosing fixtures.

- Use `*.spec.ts`/`*.spec.tsx`, never `*.test.ts`/`*.test.tsx`.
- Use identifiable local `*.mock.ts`/`*.mock.tsx` files under nearby `__mocks__`.
- Prefer real values and pure functions; use builders for repeated valid aggregate setup.
- Fake ports, time, randomness, or expensive boundaries only.
- Cover observable behavior, invalid inputs, ranges, and relevant tie/order cases.

Run focused tests, then proportional typecheck/lint/build checks. Do not encode a second copy of domain formulas in assertions.
