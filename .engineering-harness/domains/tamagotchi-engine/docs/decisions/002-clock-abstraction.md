# Decision 002: Inject time through Clock

## Status

Accepted during Engine Architecture Stage 03; formalized during Stage 06.

## Decision

Application/engine time enters through the `Clock` port. `SystemClock` is the wall-clock adapter. Domain rules receive explicit timestamps or elapsed windows and never call `Date.now()`, browser timers, or local timezone APIs.

## Why

- Offline processing and simultaneous boundaries require deterministic replay.
- Tests need exact time without waiting.
- Infrastructure time must remain replaceable.

## Consequences

- Temporal processors inject `Clock`.
- Persisted timestamps use integer Unix epoch milliseconds.
- Backward/non-finite effective time is rejected.
- Randomness, if later added, needs a separate explicit source; `Clock` is not a generic nondeterminism container.
