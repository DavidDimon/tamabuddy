---
name: update-architecture-docs
description: Update Tamabuddy engine architecture maps and ADRs after verified code changes, keeping implemented facts separate from approved future design.
---

# Update architecture docs

Read `../../../domains/tamabuddy-engine/docs/current-state.md`, `architecture.md`, and the focused topic document. Inspect source imports, public exports, tests, and Nx metadata before editing prose.

Update the narrowest owning document. Add an ADR only for a structural decision with meaningful alternatives/consequences. Mark planned work explicitly; never document a proposed class as implemented. Repair links and retrieval entrypoints when files move. Finish with a code-to-doc drift check and Markdown formatting/link validation.
