---
name: locate-extension-point
description: Locate the smallest responsible extension point for a Tamabuddy engine change before editing code or introducing a pattern.
---

# Locate an extension point

Follow `../../workflows/change-retrieval.md`, then read:

- `../../../domains/tamabuddy-engine/docs/extension-points.md`;
- `../../../domains/tamabuddy-engine/workflows/change-entry.md`;
- the owning domain/architecture document selected by the request.

Search the current implementation, nearby `__tests__`/`__mocks__`, callers, and public exports. Return the owner, affected invariants, tests/docs to update, and forbidden locations. If two owners remain plausible, state the tradeoff before editing.
