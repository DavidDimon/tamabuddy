# Shared client session

`@tamabuddy/tamabuddy-client` is the UI-agnostic integration layer used by the
web and desktop clients. Future terminal clients should consume this package
instead of duplicating engine startup and command orchestration.

## Responsibilities

- create the primary pet only when no stored pet exists;
- restore and process an existing pet through the engine;
- serialize initialization, refreshes, and commands;
- expose quick hatch through the serialized engine lifecycle operation;
- reset the primary pet through the same serialized engine queue;
- publish immutable engine snapshots through a subscription API;
- expose loading, ready, and error states without presentation copy;
- preserve repository errors so each client can choose its own recovery UI.

The package does not contain React hooks, translated messages, rendering
decisions, timers, storage implementations, or domain rules.

## Consumer boundaries

- `@tamabuddy/tamabuddy-engine` owns behavior and persistence contracts.
- `@tamabuddy/tamabuddy-client` owns application-session orchestration.
- each frontend owns refresh cadence, lifecycle hooks, messages, and visuals.
