# Dependency rules

## Allowed imports

| Source                    | May import                                                 | Must not import                                          |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| domain                    | domain peers                                               | application, engine, infrastructure, React, browser APIs |
| application               | domain, application ports                                  | concrete infrastructure, React                           |
| engine                    | domain, application ports, XState                          | React, concrete storage, browser timers                  |
| infrastructure            | application ports, domain types                            | React; ownership of domain decisions                     |
| production public API     | selected production symbols from any engine layer          | test helpers and private implementation details          |
| testing public API        | selected simulation tools and consumer-facing domain types | traces, builders, raw random/clock internals, Vitest     |
| React production features | package root public API                                    | `libs/tamabuddy-engine/src/lib/**`                       |
| React dev/test tooling    | package root plus `/testing` subpath                       | `libs/tamabuddy-engine/src/lib/**`                       |

Dependencies point inward toward domain/contracts. Infrastructure implements ports; it is never imported by domain/application logic. Composition may instantiate infrastructure at an outer boundary.

## Verified structure

- `LoadTamabuddy` depends on `TamabuddyRepository`, `Tamabuddy`, and `TamabuddyId`.
- `ElapsedTimeProcessor` depends on `Clock`.
- `SystemClock` implements `Clock` and is the only current engine source using `Date.now()`.
- `InMemoryTamabuddyRepository` implements the repository port.
- XState is confined to `engine/machine` and public actor types.
- React imports only `@tamabuddy/tamabuddy-engine` through its client.
- Consumer tests import simulation support only through `@tamabuddy/tamabuddy-engine/testing`; package exports resolve source during workspace development and built ESM/declarations for package consumers.

## Enforcement

Before finishing a change:

1. inspect new imports with `rg`;
2. run ESLint/Nx module-boundary checks;
3. inspect `src/lib/public-api/index.ts` and `src/lib/testing/public-api/index.ts` for accidental exposure;
4. reject duplicated domain constants outside their owning rule.

Nx currently enforces project boundaries, not every internal layer. These Harness rules and review cover intra-library direction until dedicated tags or lint rules provide value.
