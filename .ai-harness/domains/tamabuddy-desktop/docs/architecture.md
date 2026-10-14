# Desktop architecture

Use a light feature-oriented structure:

`app -> features -> entities -> shared`

- `app`: bootstrap, providers, screen selection, and composition only.
- `features`: user outcomes such as mascot selection, pet care, settings, and games.
- `entities`: stable concepts rendered or interpreted by several features, such as mascot manifests and visuals.
- `shared`: UI or infrastructure with demonstrated cross-feature reuse.

Adapters close external boundaries with the shared client, engine, browser storage, or Tauri. They may remain colocated with an owning feature while it has one consumer. Promote code to `shared` only after ownership is genuinely shared.

Each feature owns a small `index.ts` public contract. App composition and sibling features import that contract instead of depending on internal folders; focused tests may still exercise internals directly.

React components render and translate interaction into feature operations. Domain behavior remains in the engine. Presentation mapping can use pure functions; do not add an application class or custom hook when a direct function or component is clearer.

`entities/pet` now exposes the engine-independent `DesktopPet` and `DesktopPetAction` contracts. Translation to and from engine state/commands belongs in `features/pet/model`; visual components consume the entity contract rather than importing the engine.

This is a target direction. Existing `features/mascot` currently contains both entity-like catalog/rendering code and the mascot-selection feature; move it only as part of a behavior-preserving vertical change.
