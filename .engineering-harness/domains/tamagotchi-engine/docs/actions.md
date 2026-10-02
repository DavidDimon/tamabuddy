# Actions — specification v1.0.0

Before applying an action at timestamp `T`, process elapsed time through `T`. Scheduled effects at `T` happen before the action; an action must occur strictly before an attention deadline to count on time.

Invalid actions return a typed rejection. The rejected action has no effect on the post-elapsed snapshot; time effects already processed through `T` remain and must be saved.

| Action          | Valid when                                | Effects                                                                                                                                         |
| --------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `feedMeal`      | idle, healthy, hunger `<4`                | hunger `+1`, weight `+1`, reset consecutive snacks, increment meals; resolve hunger call when hunger becomes positive                           |
| `feedSnack`     | idle, healthy, happiness `<4`             | happiness `+1`, weight `+2`, increment snack counters; evaluate diet/overweight illness; resolve happiness call when happiness becomes positive |
| `play(result)`  | idle, healthy, weight above stage minimum | weight `-1`; increment games; on `win`, happiness `+1` and wins `+1`; only a win resolves happiness call                                        |
| `clean`         | idle, poop `>0`                           | set poop to `0`; resolve poop call; allows hygiene treatment to complete                                                                        |
| `giveMedicine`  | idle, sick                                | increment dose; second dose cures and health `+1` (max `4`); hygiene cure requires poop `<3`                                                    |
| `discipline`    | idle with active discipline call          | discipline `+1` (max `4`) and resolve call                                                                                                      |
| `turnLightsOff` | idle with active sleep call               | lights off, resolve call, enter sleeping, schedule wake                                                                                         |

`healthy` means no active illness. While sick, only `clean` and `giveMedicine` are accepted. During egg, sleeping, or dead behavior, no care action is accepted.

Medicine dose 2 against unresolved hygiene returns `requires-cleaning`, keeps dose at `1`, and leaves illness active. Successful cure clears illness and its damage schedule. Medicine cannot revive a dead pet.

Game outcome is command input (`win | loss`), not engine randomness. A future random game adapter must inject a deterministic `RandomSource` and persist enough state to replay outcomes.

Save/load are application operations, not pet actions. Saving cannot advance time; loading validates/migrates, then elapsed time is processed using injected Clock.
