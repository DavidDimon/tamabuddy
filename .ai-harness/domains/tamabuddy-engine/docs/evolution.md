# Evolution — specification v1.0.0

Evolution is time-gated and deterministic. At each stage transition, calculate care score from the stage being left, record an evolution entry, reset stage statistics, then apply the next stage minimum weight and schedules.

## Stage statistics

Track per stage:

- care mistakes;
- meals and snacks;
- games played and won;
- sickness episodes.

## Score

Start at `8`:

- subtract `2 × careMistakes`, capped at `6` points;
- subtract sickness episodes, capped at `2` points;
- subtract `1` when snacks exceed meals;
- add `1` when discipline is at least `3`;
- add `1` when at least three games were played and win rate is at least 50%.

Clamp result to `0..10`:

- `8..10`: `thriving`;
- `4..7`: `balanced`;
- `0..3`: `struggling`.

Persist `{fromStage, toStage, at, score, profile}` in `evolutionHistory`. V1 profiles affect evolution history/selection only; they do not silently change decay rates.

## Transition rules

- Evolution requires an alive pet and the stage duration from `lifecycle.md`.
- Active illness defers evolution until cure; transition uses cure time.
- Sleep does not block evolution.
- Death at the same timestamp cancels evolution.
- No randomness or character-specific names exist in v1.

Implement scoring as a pure function. Use Specifications only if later evolution variants need independently reusable/composable criteria.
