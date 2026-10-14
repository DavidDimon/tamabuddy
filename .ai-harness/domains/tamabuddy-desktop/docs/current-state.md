# Desktop current state

Verified against `apps/tamabuddy-desktop` on 2026-10-14.

## Runtime and entry points

- `src/main.tsx` mounts the React application.
- `src/app/app.tsx` restores mascot selection and chooses between onboarding and the game.
- `src/app/GameScreen.tsx` owns in-memory game/settings navigation and operation coordination. `src/app/GameView.tsx` composes the care UI without owning those effects.
- Tauri packages the Vite application; no Tauri command boundary is currently used by the React features.
- The Vite config derives the React production/development definition from the Vite command and `TAURI_ENV_DEBUG`. This keeps Nx production builds optimized even though Nx launches package scripts with `NODE_ENV=development`, while native debug builds retain sourcemaps.

## Implemented feature areas

- `features/mascot`: catalog, manifests, selection UI, sprite rendering, reaction/visual resolution, and feature-owned styles.
- `features/pet`: action menu, hatch countdown, status meter, presentation mapping, React synchronization hook, desktop client adapter, and feature-owned styles.
- `features/settings`: settings UI, versioned local-storage preferences, and feature-owned styles.
- `features/game`: random game outcome helper.
- `entities/pet`: engine-independent desktop state/action contract consumed by app composition and visual features.

Each feature exposes its app-facing and cross-feature contract from a local `index.ts`. ESLint permits tests to reach focused internals, but production app and sibling-feature imports must use those public entry points.

`TamabuddyDesktopClient` adapts `@tamabuddy/tamabuddy-client` snapshots and engine command results into desktop status messages. `toDesktopPet` maps the engine snapshot to the smaller `DesktopPet` presentation contract and maps desktop actions back to engine commands. `useTamabuddyDesktop` subscribes with `useSyncExternalStore`, derives the hatch deadline, and owns refresh/reaction effects. Pet state persistence remains implemented by the engine's local-storage repository; mascot selection is stored separately by `DesktopPreferencesStore`.

## Current pressures

- Feature styles use globally scoped class names; ownership is colocated, but CSS isolation is not enforced.
- `features/mascot` still combines entity-like catalog/rendering code with the mascot-selection feature. Move it only when a vertical change benefits from the separation.

## Quality gates

- ESLint prevents app composition, presentation features, and entities from importing the engine/client directly; features cannot import app composition; and production app/cross-feature imports must use feature public entry points.
- Nx identifies the project with `type:app` and `platform:desktop` tags.
- `pnpm test:coverage` runs the workspace coverage target. The desktop baseline fails below 80% statements, 70% branches, 84% functions, or 82% lines.
- The care, settings, destructive-confirmation, and onboarding layouts are visually checked at the native 360×620 window and its 320×520 minimum. Busy/error messages expose assistive semantics, keyboard focus remains visible, and compact-height mascot art does not overlap the action menu.

These pressures justify incremental clarification, not a rewrite or a mandatory new state library.
