# Processors

## Implemented

`ElapsedTimeProcessor` receives `Clock` and returns `{from, to, elapsed}`. It rejects non-finite or future `from` values. It currently calculates a window only; it does not mutate a Tamabuddy or execute v1 schedules.

`TamabuddyProcessor` implements v1 chronological coordination:

1. obtain effective time from injected `Clock`;
2. jump to the next scheduled boundary;
3. invoke the owning pure rule;
4. request a behavioral transition when required;
5. repeat until target time or death;
6. return a restored aggregate plus typed command outcome for atomic persistence/publication.

It does not iterate once per minute. `domain/rules/elapsedRules.ts` owns decay, illness, evolution, attention, and schedule transformations; the processor owns boundary order and machine requests.

`processWithTrace()` follows that same processing path and returns the final aggregate plus ordered entries containing the boundary timestamp and cloned snapshots before and after each effective change. `process()` delegates to it and discards only the observations. `commandWithTrace()` additionally separates automatic processing entries from a command observation containing the command, acceptance/rejection, and command-specific before/after snapshots. Trace data is transient, deterministic, and absent from `TamabuddyState` and persistence.

The internal life simulation runner consumes these observations to build its timeline. It derives semantic events from state transitions; events do not feed back into the processor or become a second behavior mechanism.

## When to add a processor

Use one when a single event coordinates several owned transformations or must enforce cross-rule order. Keep a direct entity method/pure function when only one invariant changes. A processor must have focused tests for ties, offline spans, idempotent replay boundaries, and failure atomicity.
