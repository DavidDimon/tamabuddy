# Needs and decay — specification v1.0.0

## Scales

- `hunger`, `happiness`, `discipline`, `health`: integers `0..4`.
- `weight`: integer `1..99` after hatch; egg weight is `0`.
- `poopCount`: integer `0..3`.
- Need changes clamp to their range; excess care has no hidden overflow.

Discipline does not decay. Health changes only through neglect, untreated illness, or successful treatment.

## Stage rates

| Stage   | Hunger -1 | Happiness -1 | New poop | Minimum weight | Healthy max |
| ------- | --------: | -----------: | -------: | -------------: | ----------: |
| `baby`  |    30 min |       30 min |   60 min |              5 |          12 |
| `child` |    60 min |       90 min |  180 min |             10 |          20 |
| `teen`  |    75 min |      120 min |  240 min |             15 |          30 |
| `adult` |    90 min |      150 min |  300 min |             20 |          40 |
| `elder` |   120 min |      180 min |  360 min |             20 |          45 |

Egg has no needs. On evolution, retain meters, raise weight to the new minimum if lower, and schedule future decay using the new stage rates from transition time. A rate table/pure lookup is sufficient; do not introduce Strategy classes unless algorithms later differ, not merely constants.

## Critical neglect

While awake, start one neglect timer when hunger or happiness first reaches `0`. Every uninterrupted 120 minutes with either meter at `0` removes one health point. Resolving both zero meters clears the timer. Sleep pauses it.

When a penalty leaves health at `1`, start a `weakness` illness if not already sick. Health `0` causes death in the same processing boundary.

## Hygiene and illness triggers

- Reaching `poopCount=3` starts `hygiene` illness.
- Third consecutive snack since the last meal starts `diet` illness and resets the snack counter.
- A snack that raises weight above `healthy max + 5` starts `overweight` illness.
- Illness never stacks; the first active cause remains until cured.

Untreated illness removes one health point every 60 minutes, including during sleep. Treatment rules live in `actions.md`.
