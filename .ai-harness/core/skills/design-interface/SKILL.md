---
name: design-interface
description: Audit or improve Tamabuddy desktop visual design and interaction states while preserving its retro identity, accessibility, behavior, and existing React/CSS stack. Use for visual redesign, polish, styling, or UI-state reviews; not for architecture-only changes.
---

# Design the desktop interface

Read the desktop [`current-state.md`](../../../domains/tamabuddy-desktop/docs/current-state.md) and [`visual-language.md`](../../../domains/tamabuddy-desktop/docs/visual-language.md), inspect the actual component, styles, tests, and native window constraints, then read the pinned audit reference at `../../../external/taste-skill/skills/redesign-existing-projects/SKILL.md`.

Use the external checklist to find evidence, not to impose its preferred aesthetic. Keep only findings observable in Tamabuddy. In particular:

- preserve the compact retro-digital identity and mascot-specific accents;
- work with React and vanilla CSS already in the app;
- cover onboarding, loading/error, care, settings, destructive confirmation, disabled, focus, and reduced-motion states as relevant;
- prefer tokens and feature-owned styles over a generic design-system scaffold;
- do not add fonts, icons, imagery, animation libraries, or remote assets without a demonstrated need and dependency review;
- do not apply marketing-page patterns, wide containers, scroll choreography, stock imagery, or generic premium styling to the desktop game.

For an audit, report prioritized evidence and the smallest visual correction. For implementation, preserve behavior and run focused component tests plus browser/native visual checks proportional to the change.
