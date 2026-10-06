# Time model — specification v1.0.0

All timestamps are integer Unix epoch milliseconds. Engine time comes only from injected `Clock`. Reject non-finite timestamps and any command/load whose effective time is before `lastProcessedAt`.

## Online and offline

There is no domain pause. Stopping UI/actor activity only delays processing. On reentry, process the full interval from `lastProcessedAt` to Clock time; do not cap elapsed time. Stop early once dead.

Do not iterate every minute. Jump chronologically between scheduled boundaries: decay, poop, discipline opportunity, attention deadline/cooldown, sleep/wake, illness/neglect damage, evolution, and natural death.

## Boundary order

At each timestamp:

1. If already dead, stop.
2. Apply automatic hatch or wake.
3. Expire prior attention; record mistake and automatic sleep when applicable.
4. Apply due hunger/happiness decay.
5. Generate due poop.
6. Evaluate new illness triggers.
7. Apply illness and critical-neglect health damage.
8. Evaluate death; if dead, clear schedules and stop.
9. Apply due evolution when not sick.
10. Mark due discipline opportunities and open the highest-priority eligible attention call.
11. Advance schedules and `lastProcessedAt`.

For multiple occurrences of one repeating event at the same timestamp, apply it once, advance its schedule, then continue until its next timestamp is future. A command at timestamp `T` runs after all boundary effects at `T`.

## Determinism

Equal persisted state + equal ordered commands + equal Clock values must produce equal state/events. No hidden timers, browser APIs, unseeded randomness, or local timezone calculations.
