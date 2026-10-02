---
name: understand-engine-architecture
description: Explain or verify the Tamagotchi engine's current layers, dependency direction, public API, state ownership, and React boundary before architecture-sensitive work.
---

# Understand engine architecture

1. Read `../../../domains/tamagotchi-engine/docs/current-state.md` first.
2. Read `architecture.md` and `dependency-rules.md` in that directory.
3. Inspect `libs/tamagotchi-engine/src`, its public barrel, and relevant imports.
4. Inspect the React client only when the consumer boundary matters.
5. Separate implemented facts from approved future design.

Report boundaries, ownership, public surface, and any code/document drift. Never infer implementation from a planned directory or domain specification.
