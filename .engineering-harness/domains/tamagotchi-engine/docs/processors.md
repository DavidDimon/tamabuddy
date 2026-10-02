# Processors

## Implemented

`ElapsedTimeProcessor` receives `Clock` and returns `{from, to, elapsed}`. It rejects non-finite or future `from` values. It currently calculates a window only; it does not mutate a Tamagotchi or execute v1 schedules.

`TamagotchiProcessor` implements v1 chronological coordination:

1. obtain effective time from injected `Clock`;
2. jump to the next scheduled boundary;
3. invoke the owning pure rule;
4. request a behavioral transition when required;
5. repeat until target time or death;
6. return a restored aggregate plus typed command outcome for atomic persistence/publication.

It does not iterate once per minute. `domain/rules/elapsedRules.ts` owns decay, illness, evolution, attention, and schedule transformations; the processor owns boundary order and machine requests.

## When to add a processor

Use one when a single event coordinates several owned transformations or must enforce cross-rule order. Keep a direct entity method/pure function when only one invariant changes. A processor must have focused tests for ties, offline spans, idempotent replay boundaries, and failure atomicity.
