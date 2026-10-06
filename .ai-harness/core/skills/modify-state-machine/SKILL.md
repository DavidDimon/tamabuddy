---
name: modify-state-machine
description: Add or alter durable XState behavior in the engine without moving numeric domain rules or atomic actions into machine configuration.
---

# Modify the state machine

Read `../../../domains/tamabuddy-engine/docs/state-machine.md`, `lifecycle.md`, `invariants.md`, and `decisions/001-xstate-v5.md`. Inspect the current machine, actor factory, public snapshot/event types, client, and transition tests.

Use XState only for durable `egg`, `idle`, `sleeping`, and `dead` behavior unless a reviewed domain change adds another durable state. Keep needs, illness, scoring, time arithmetic, and persistence outside machine config. Test valid/rejected transitions, guards, tie precedence, terminal behavior, and consumer-visible snapshots. Update docs and public types when ownership changes.
