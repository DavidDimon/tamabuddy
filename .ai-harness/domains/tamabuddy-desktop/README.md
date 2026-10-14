# Tamabuddy desktop harness

Entry point for changes under `apps/tamabuddy-desktop`. The app is a React 19 client packaged with Tauri and uses the shared Tamabuddy client and engine libraries.

## Read before changing the desktop

1. [`docs/current-state.md`](docs/current-state.md) for implemented facts.
2. [`docs/architecture.md`](docs/architecture.md) and [`docs/dependency-rules.md`](docs/dependency-rules.md) for ownership and allowed dependency direction.
3. [`docs/extension-points.md`](docs/extension-points.md) to place the change.
4. [`docs/visual-language.md`](docs/visual-language.md) for visual or interaction changes.
5. Current source, adjacent tests, and shared client/engine public contracts before editing.

Use the smallest feature-local mechanism that keeps React presentation, application orchestration, persistence, and domain behavior distinguishable. The target architecture is incremental; do not create empty layers or move files solely to match a diagram.

For a visual audit or redesign, load `design-interface` from the core skill index after reading the visual language. External Taste Skill guidance is advisory and never overrides product identity, accessibility, native-window constraints, or tested behavior.
