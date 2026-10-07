# Mascot family review

## Scope

This review compares the six production manifests at the same `24 × 13` cell
canvas. It covers silhouette separation, evolution anchors, monochrome reading,
effect margins, motion timing, semantic color roles, and compatibility with the
shared desktop renderer.

## Adult idle comparison

```text
PINGO          FAÍSCA         BROTO
 . \|/ .       *  ^  *        .^^^^^.
 .-^^^-.        /^^^\        /^^^^^^^\
 /     \       /^^^^^\       \__|||__/
 | o o |       | o o |         /   \
 |  w  |       |  w  |        / o o \
 \_____/        \___/        (   w   )
 '-----'       _/| |\_        \_____/
 / / \ \                       _/ \_

NEXO           MIMO           SOMBRIN
 ||   ||       /|     |\       /\   /\
 /\___/\     / |     | \     /^^\_/^^\
/       \     \ |_____| /     <\     />
| o   o |      /       \       | o o |
|   w   |     |  o   o  |      |  w  |
\_______/     |  ( w )  |      \_____/
=[|___|]=      \_______/      /|/   \|\
  /   \        _/|   |\_       _/   \_
```

## Findings

| Family  | Stable anchors across stages                  | Distinguishing effects       | Result   |
| ------- | --------------------------------------------- | ---------------------------- | -------- |
| Pingo   | Droplet body and water crown                  | Droplets and wave cues       | Approved |
| Faísca  | Ember body and uneven flame crown             | Sparks and layered flame     | Approved |
| Broto   | Seed body, central stem, leaves, and roots    | Leaves, rain, and growth     | Approved |
| Nexo    | Antenna ears, rectangular chassis, data face  | Bits, cursor, and data lines | Approved |
| Mimo    | Long ears, round face, and soft body          | Hearts and bubbles           | Approved |
| Sombrin | Rounded core, pointed horns, and folded wings | Slow shadow wisps            | Approved |

All equivalent-stage idle frames are structurally distinct. Temporary effects
remain inside the shared canvas and do not move the body baseline. Every family
uses printable ASCII for sprite art and remains identifiable without color.

## Runtime readiness

- The shared renderer accepts any manifest in the canonical catalog.
- Semantic family palettes are selected by mascot id; state meaning does not
  depend on color.
- Reduced-motion mode holds the first meaningful frame.
- Manifest tests cover all 576 stage/state combinations and reject canvas,
  timing, missing-state, duplicate-silhouette, and non-ASCII regressions.

The current vertical slice still selects Pingo as its primary pet. Persisted
mascot selection is a separate product capability and is not part of the visual
asset review.
