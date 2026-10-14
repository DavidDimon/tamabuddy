---
name: understand-desktop-architecture
description: Explain or verify the Tamabuddy desktop app's current React, client, engine, persistence, feature, and visual boundaries before architecture-sensitive UI work.
---

# Understand desktop architecture

1. Read `../../../domains/tamabuddy-desktop/docs/current-state.md` first.
2. Read `architecture.md`, `dependency-rules.md`, and `extension-points.md` only as needed for the question.
3. Inspect `apps/tamabuddy-desktop/src`, nearby tests, Nx metadata, and the shared client public API.
4. Distinguish implemented facts from target architecture. Report mismatches rather than describing proposals as current behavior.

Do not recommend a state library, router, design system, or new layer without a concrete pressure in the current code.
