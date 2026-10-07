# Mascot animation contract

## Required visual keys

Every production mascot must provide a fallback frame for every engine stage:

```text
egg
baby
child
teen
adult
elder
```

For each non-egg stage, the following visual states are required:

| Key           | Meaning                        | Animation requirement               |
| ------------- | ------------------------------ | ----------------------------------- |
| `idle`        | Default awake state            | Two or three subtle frames          |
| `happy`       | Positive reaction              | Short, non-looping reaction         |
| `sad`         | Low happiness                  | Static or slow loop                 |
| `hungry`      | Hunger attention               | Static plus optional stomach effect |
| `sleeping`    | Engine behavior is sleeping    | Slow loop, reduced-motion safe      |
| `playing`     | Accepted play command          | Short, non-looping reaction         |
| `eatingMeal`  | Accepted meal command          | Short, non-looping reaction         |
| `eatingSnack` | Accepted snack command         | Short, non-looping reaction         |
| `dirty`       | Poop requires cleaning         | Static with a separate dirt marker  |
| `sick`        | Illness exists                 | Static or slow loop                 |
| `medicine`    | Accepted medicine command      | Short, non-looping reaction         |
| `discipline`  | Accepted discipline command    | Short, non-looping reaction         |
| `attention`   | An attention call is active    | Static plus a visible marker        |
| `evolving`    | Stage changed after processing | One transition sequence             |
| `dead`        | Engine behavior is dead        | Static final frame                  |

The egg stage requires `idle`, `evolving`, and `dead` fallbacks. Unsupported combinations resolve through [`state-priority.md`](state-priority.md); components must not invent ad hoc frame names.

## Timing

- idle and sleeping loops: 1–2 frames per second;
- elemental ambient effects: at most 4 frames per second;
- action reactions: 4–6 frames per second, lasting no longer than 1.5 seconds;
- evolution: no longer than 3 seconds before settling on the new stage;
- no continuously flashing full-frame effects.

Animation timing is presentation state. It must not delay, repeat, or reverse an engine command.

## Frame stability

- All frames in one animation use the same width and height.
- The body baseline stays fixed.
- The renderer preserves spaces exactly.
- Effects may extend into the two-cell effect margin but never change layout size.
- A missing optional animation falls back to the stage's `idle` frame.
- A missing required fallback is a build-time validation error.

## Command reactions

Transient reactions begin only after an accepted `EngineCommandResult`. Rejected commands keep the current snapshot visual and show a textual rejection message in the action area.

The game result is external input to the engine. The mascot animation visualizes the accepted `win` or `loss`; it does not choose the result.
