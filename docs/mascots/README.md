# Tamabuddy mascot guide

This directory defines the visual contract for the desktop client's terminal-style mascots. It does not define care, time, health, or evolution rules. Those behaviors remain owned by `@tamabuddy/tamabuddy-engine`.

## Canonical mascot families

| Id        | Name    | Theme              | Personality  | Accent            |
| --------- | ------- | ------------------ | ------------ | ----------------- |
| `pingo`   | Pingo   | Water elemental    | Curious      | Cyan              |
| `faisca`  | Faísca  | Fire elemental     | Animated     | Yellow and orange |
| `broto`   | Broto   | Nature elemental   | Calm         | Green             |
| `nexo`    | Nexo    | Digital creature   | Analytical   | Purple            |
| `mimo`    | Mimo    | Companion creature | Affectionate | Cream and pink    |
| `sombrin` | Sombrin | Shadow creature    | Reserved     | Muted violet      |

The approved concept guide establishes each mascot's name, theme, personality, dominant color, three example forms, and Pingo's initial state studies. The character sheets in this directory turn those concepts into production constraints.

## Source-of-truth order

1. Engine types and behavior determine the real lifecycle and state.
2. [`visual-language.md`](visual-language.md) determines shared appearance and layout constraints.
3. [`animation-contract.md`](animation-contract.md) determines required visual states and animation behavior.
4. [`state-priority.md`](state-priority.md) determines how an engine snapshot selects a visual.
5. Each mascot sheet determines silhouette, personality, and stage-specific visual anchors.
6. Versioned mascot manifests and frames implement these documents.

Do not copy domain formulas, timing, rejection rules, or evolution scores into mascot assets or UI components.

## Desktop target

The first client is a compact vertical desktop window for Windows and macOS:

- default logical size: `360 × 620`;
- minimum logical size: `320 × 520`;
- mascot remains the dominant area;
- status stays above the mascot;
- care actions remain in a persistent menu below it;
- the interface remains usable without color and without mouse input.

## Production sequence

1. Produce and validate Pingo as the reference implementation.
2. Apply the same manifest and completeness tests to Faísca, Broto, Nexo, Mimo, and Sombrin.
3. Review all families together at identical canvas size before release.

All three production steps are complete. See the
[`family-review.md`](family-review.md) comparison for the combined results and
the remaining product-level selection boundary.
