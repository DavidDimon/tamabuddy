# Persistence

## Implemented

`application/ports/TamabuddyRepository.ts` defines:

- `findById(id): Promise<Tamabuddy | null>`;
- `save(tamabuddy): Promise<void>`.

`InMemoryTamabuddyRepository` stores cloned `TamabuddyState` snapshots in a `Map` and restores aggregates through invariant validation. `TamabuddyEngine` saves after create, elapsed load, accepted command, or rejected command with elapsed changes.

This adapter supports tests/development only: no durable serialization, concurrency control, or migration.

## Approved durable boundary

- Domain/application depend on the repository port, never a backend.
- Persist the v1 fields and schedules listed in `domain-model.md`.
- Save a successful elapsed/command batch atomically.
- Validate `schemaVersion`, ranges, chronology, and required fields on load.
- Translate records through infrastructure mappers; do not expose storage DTOs as entities.
- Run version-specific Adapters for legacy saves before aggregate reconstruction.
- After validation/migration, process offline elapsed time with injected `Clock`.

## Evolution of the save format

A compatibility change requires migration tests, documentation, and a schema-version decision. Reject unknown future versions and malformed records with typed failures. Never silently reset invalid fields or let React repair saves.

Repository contract tests should be reusable across in-memory and future durable adapters, with extra round-trip/migration tests per format.
