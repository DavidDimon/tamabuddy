# Decision 003: Layered dependency boundaries

## Status

Accepted during Engine Architecture Stage 03; formalized during Stage 06.

## Decision

Use domain, application, engine, infrastructure, and public-API boundaries inside `tamagotchi-engine`. Dependencies point toward domain/contracts. React consumes only the package root. Infrastructure implements application ports and cannot own care rules.

## Why

- Domain behavior must run without React or browser lifecycle.
- Clock and persistence need replaceable adapters.
- One public barrel prevents accidental coupling to file layout.
- Clear ownership reduces duplicated rules.

## Consequences

- Internal imports follow `dependency-rules.md`.
- New consumer-facing symbols require deliberate public export review.
- Nx/ESLint plus Harness review enforce boundaries.
- Extra interfaces or layers still require a real substitution/ownership need.
