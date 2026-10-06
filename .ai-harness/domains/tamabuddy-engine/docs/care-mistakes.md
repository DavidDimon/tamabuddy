# Attention and care mistakes — specification v1.0.0

An attention call represents a care opportunity with `reason`, `openedAt`, and `expiresAt`. Deadline is 15 minutes.

## Call triggers and resolution

| Reason       | Trigger                                                                              | Resolution                             |
| ------------ | ------------------------------------------------------------------------------------ | -------------------------------------- |
| `sickness`   | illness begins                                                                       | successful cure                        |
| `poop`       | poop reaches `2`                                                                     | clean                                  |
| `hunger`     | hunger reaches `0`                                                                   | meal raises hunger                     |
| `happiness`  | happiness reaches `0`                                                                | winning play or snack raises happiness |
| `sleep`      | scheduled sleep time                                                                 | turn lights off                        |
| `discipline` | after 30 awake minutes in child/teen, then every 6 awake hours while discipline `<4` | discipline                             |

Only one call is active. If several qualify together, priority is sickness, poop, hunger, happiness, sleep, discipline. A lower-priority reason remains pending and gets its 15-minute deadline only when it becomes the active call.

## Care mistake

Expiring an unresolved call adds one cumulative and one stage care mistake. After expiration:

- sleep auto-resolves by entering sleep;
- discipline is consumed until the next scheduled discipline call;
- other unmet reasons enter a 60-minute cooldown before they may call again.

Handling a need after the deadline improves the need but does not erase the recorded mistake. Calls do not open while egg, sleeping, or dead; qualified calls are reconsidered on wake.

Discipline is valid only for an active discipline call. Punishing a justified need is rejected and never improves discipline. A resolved or expired discipline call schedules the next opportunity after 6 awake hours; stage transition clears any old opportunity and applies the next stage rule.
