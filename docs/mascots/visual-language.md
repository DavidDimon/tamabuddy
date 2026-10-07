# Mascot visual language

## Rendering model

Mascots are text-grid sprites rendered in a bundled monospace font. Every frame is an array of equal-length rows; runtime code must not repair alignment or infer missing padding.

Canonical sprite canvas:

- maximum width: 24 cells;
- maximum height: 16 cells;
- one Unicode code point per logical cell;
- stable canvas dimensions across every frame of one animation;
- no terminal escape sequences inside frame data.

ANSI-inspired color is applied by the renderer through semantic tokens. Frame content stays independent of terminal color codes.

## Glyph policy

Prefer portable ASCII for structural marks:

```text
/ \ | _ - . , ' ` ( ) [ ] < > ^ v o O * + =
```

The following extended glyph groups may be used only after coverage is verified in the bundled font on Windows and macOS:

```text
Box drawing: ─ │ ┌ ┐ └ ┘ ┬ ┴ ├ ┤ ╭ ╮ ╰ ╯
Faces:        • ◡ ▿ ω
Effects:      ✦ ✧ ≈ ≪ ≫
```

Every frame must remain understandable if decorative effect glyphs are removed. Color or a special glyph must never be the only indication of sickness, sleep, attention, or death.

## Silhouette rules

- A mascot must remain recognizable when converted to one color.
- Eyes and mouth must fit within the central half of the canvas.
- Evolution may add mass and detail but must retain at least two family anchors.
- Idle frames must not change the outer silhouette by more than two cells unless the animation depicts breathing or elemental motion.
- Effects such as water drops, flames, leaves, data particles, hearts, or shadow wisps occupy the outer two-cell effect margin and must not shift the body alignment.

## Color roles

| Family  | Primary      | Secondary   | Highlight     |
| ------- | ------------ | ----------- | ------------- |
| Pingo   | Cyan         | Blue        | Pale cyan     |
| Faísca  | Yellow       | Orange      | Pale yellow   |
| Broto   | Green        | Dark green  | Pale green    |
| Nexo    | Purple       | Violet      | Pale lavender |
| Mimo    | Cream        | Pink        | Pale cream    |
| Sombrin | Muted violet | Dark purple | Gray lavender |

The desktop theme owns actual color values. Mascot manifests reference semantic roles only.

## Window composition

The target vertical window is divided into stable zones:

| Zone         |             Target height | Content                              |
| ------------ | ------------------------: | ------------------------------------ |
| Identity     |                     40 px | Name, stage, day                     |
| Status       |                  50–60 px | Needs and attention                  |
| Mascot stage | Flexible, at least 300 px | Sprite, effects, short message       |
| Action menu  |                110–130 px | Keyboard shortcuts and action states |

The mascot canvas is centered within the flexible stage. The menu must not overlap it and the outer window must not use internal scrolling at the minimum supported size.

## Accessibility

- Provide a textual description for the current visual state.
- Honor reduced-motion preferences by showing the first meaningful frame.
- Pair every color with a label, shape, or expression.
- Keep status and action text readable at 200% zoom.
- Do not communicate an urgent attention call through blinking alone.
