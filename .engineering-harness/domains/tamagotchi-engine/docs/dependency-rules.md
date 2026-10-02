# Dependency rules

## Allowed imports

| Source         | May import                             | Must not import                                          |
| -------------- | -------------------------------------- | -------------------------------------------------------- |
| domain         | domain peers                           | application, engine, infrastructure, React, browser APIs |
| application    | domain, application ports              | concrete infrastructure, React                           |
| engine         | domain, application ports, XState      | React, concrete storage, browser timers                  |
| infrastructure | application ports, domain types        | React; ownership of domain decisions                     |
| public API     | selected symbols from any engine layer | test helpers and private implementation details          |
| React app      | package root public API                | `libs/tamagotchi-engine/src/lib/**`                      |

Dependencies point inward toward domain/contracts. Infrastructure implements ports; it is never imported by domain/application logic. Composition may instantiate infrastructure at an outer boundary.

## Verified structure

- `LoadTamagotchi` depends on `TamagotchiRepository`, `Tamagotchi`, and `TamagotchiId`.
- `ElapsedTimeProcessor` depends on `Clock`.
- `SystemClock` implements `Clock` and is the only current engine source using `Date.now()`.
- `InMemoryTamagotchiRepository` implements the repository port.
- XState is confined to `engine/machine` and public actor types.
- React imports only `@tamabuddy/tamagotchi-engine` through its client.

## Enforcement

Before finishing a change:

1. inspect new imports with `rg`;
2. run ESLint/Nx module-boundary checks;
3. inspect `src/lib/public-api/index.ts` for accidental exposure;
4. reject duplicated domain constants outside their owning rule.

Nx currently enforces project boundaries, not every internal layer. These Harness rules and review cover intra-library direction until dedicated tags or lint rules provide value.
