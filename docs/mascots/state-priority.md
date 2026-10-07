# Mascot state priority

The renderer derives visuals from the public `TamabuddyState` and the most recent accepted command reaction. It does not calculate domain outcomes.

## Stable snapshot priority

Evaluate the snapshot in this order and select the first matching state:

1. `behavior === 'dead'` → `dead`.
2. `behavior === 'egg'` → egg `idle`.
3. `behavior === 'sleeping'` → `sleeping`.
4. `illness !== null` → `sick`.
5. `poopCount > 0` → `dirty`, while preserving any attention marker.
6. `attention !== null` → attention-specific expression plus `attention` marker.
7. `hunger === 0` → `hungry`.
8. `happiness === 0` → `sad`.
9. Otherwise → `idle`.

An attention reason refines text and effects but does not create undocumented domain state:

| Attention reason | Visual cue                             |
| ---------------- | -------------------------------------- |
| `sickness`       | Sick expression and medicine cue       |
| `poop`           | Dirt marker and cleaning cue           |
| `hunger`         | Hungry expression and food cue         |
| `happiness`      | Sad expression and play cue            |
| `sleep`          | Tired expression and lights cue        |
| `discipline`     | Mischief expression and discipline cue |

## Transient reaction priority

After an accepted command, a short reaction may temporarily render over the stable snapshot:

| Command            | Reaction                                    |
| ------------------ | ------------------------------------------- |
| `feedMeal`         | `eatingMeal`                                |
| `feedSnack`        | `eatingSnack`                               |
| `play` with `win`  | `playing` with happy ending                 |
| `play` with `loss` | `playing` with neutral ending               |
| `clean`            | cleaning effect, then resolved stable state |
| `giveMedicine`     | `medicine`                                  |
| `discipline`       | `discipline`                                |
| `turnLightsOff`    | transition directly to `sleeping`           |

The renderer returns to the stable snapshot after the reaction timeout. Closing, hiding, suspending, or resuming the window cancels transient animation without changing engine state.

## Evolution detection

Show `evolving` only when two observed snapshots have different `stage` values. The engine remains the only owner of the stage transition and its timestamp.
