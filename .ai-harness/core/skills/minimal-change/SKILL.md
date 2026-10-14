---
name: minimal-change
description: Implement a Tamabuddy coding change with the smallest complete diff after locating current ownership, callers, tests, and boundaries. Use for implementation or refactoring where over-engineering and unnecessary dependencies are risks; not for planning-only requests.
---

# Implement the smallest complete change

Follow `../../workflows/change-retrieval.md`, `../../rules/change-discipline.md`, and the owning domain before reading the pinned Ponytail reference at `../../../external/ponytail/skills/ponytail/SKILL.md`.

Tamabuddy rules determine ownership and dependencies. Use Ponytail to choose the smallest complete mechanism inside those boundaries:

- reuse the current implementation path before adding another;
- prefer a direct function, component, or platform capability over speculative abstraction;
- finish affected callers, tests, fixtures, exports, and documentation;
- never remove validation, persistence safety, error handling, accessibility, or requested behavior to shrink the diff;
- add a focused test for new non-trivial logic.

Do not activate session modes, write `shortcut:` comments, or change reply format merely because the upstream skill suggests them. Use a shortcut marker only when the user accepts a known limit and the repository has adopted that marker.

Before finishing, run proportional checks and state material omissions or unresolved risks.
