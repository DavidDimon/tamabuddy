# Lifecycle — specification v1.0.0

## Stages

| Stage   | Begins      | Eligible next stage     |
| ------- | ----------- | ----------------------- |
| `egg`   | creation    | `baby` after 5 minutes  |
| `baby`  | hatch       | `child` after 1 hour    |
| `child` | child start | `teen` after 24 hours   |
| `teen`  | teen start  | `adult` after 48 hours  |
| `adult` | adult start | `elder` after 120 hours |
| `elder` | elder start | no evolution            |

Stage age uses elapsed real time, including sleep and offline periods. If sick when evolution becomes due, defer transition until cured; the next stage starts at cure time. Sleep does not defer evolution.

## Behavioral machine

- `egg`: no care action accepted; hatch is automatic.
- `idle`: accepts actions allowed by current needs/condition.
- `sleeping`: rejects user care actions; wake is automatic.
- `dead`: terminal; rejects all commands except read/export.

Hatch sets `stage=baby`, `behavior=idle`, hunger and happiness to `4`, health to `4`, discipline to `0`, weight to `5`, and starts baby schedules.

## Sleep cycle

Baby has no scheduled sleep during its one-hour stage. Child, teen, and adult use 16 awake hours + 8 sleep hours. Elder uses 14 awake hours + 10 sleep hours.

At sleep time, open a `sleep` attention call. Turning lights off before its 15-minute deadline enters `sleeping`. Missing the deadline records one care mistake, turns lights off, and sleeps automatically. Wake sets `behavior=idle`, `lightsOn=true`, and schedules the next sleep.

Hunger, happiness, poop, discipline-opportunity, and neglect timers pause during sleep; shift their next timestamps by the actual sleep duration. Illness damage and natural age continue. If evolution occurs during sleep, start the new stage's paused need schedules at `wakeAt + new stage rate`.

## Death

Death occurs immediately when:

- `health` reaches `0`; or
- age since hatch reaches 14 days.

Death wins ties with evolution and attention. Transition to `dead`, clear active attention and future care schedules, and preserve history for read/export.
