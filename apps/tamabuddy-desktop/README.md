# Tamabuddy Desktop

Virtual-pet application built with React 19 and packaged as a native app with Tauri 2.

## What it provides

- mascot selection onboarding;
- manifest-driven mascot visuals and reactions;
- pet state, need meters, and a hatch countdown;
- feeding, snack, play, cleaning, medicine, discipline, and sleep actions;
- settings and a confirmed game reset;
- pet-state and preference persistence in the webview's `localStorage`.

The native window is deliberately compact: it starts at `360×620`, has a `320×520` minimum, stays above other windows, and cannot be maximized.

## Main flow

`App` restores the mascot choice and switches between onboarding and the game. `GameScreen` coordinates navigation and operations, while presentation components receive an engine-independent `DesktopPet` contract.

At the pet feature boundary, `TamabuddyDesktopClient` adapts the shared session and translates engine results into UI messages. `toDesktopPet` maps state and actions between domain and presentation contracts. `useTamabuddyDesktop` connects the session to React with `useSyncExternalStore`.

## Structure

```text
src/
├── app/                  # screen bootstrap and composition
├── entities/pet/         # engine-independent presentation contract
├── features/
│   ├── game/             # randomized game outcome
│   ├── mascot/           # catalog, selection, sprites, and reactions
│   ├── pet/              # care UI, adapter, hook, and mapping
│   └── settings/         # preferences and settings UI
└── main.tsx              # React bootstrap
src-tauri/                # native host, configuration, capabilities, and icons
```

Each feature exposes its application-facing contract through an `index.ts`. Application composition and sibling features use those entrypoints; focused tests may access internals when needed.

## Native prerequisites

In addition to the monorepo requirements, native builds require Rust `1.90` and the platform dependencies listed in the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

## Run

From the monorepo root:

```bash
# Vite frontend without the native host
pnpm nx run @tamabuddy/tamabuddy-desktop:dev

# Native application in development mode
pnpm nx run @tamabuddy/tamabuddy-desktop:native:dev
```

Vite uses `http://127.0.0.1:4210`; build preview uses port `4310`.

## Validate and package

```bash
pnpm nx run @tamabuddy/tamabuddy-desktop:typecheck
pnpm nx run @tamabuddy/tamabuddy-desktop:lint
pnpm nx run @tamabuddy/tamabuddy-desktop:test
pnpm nx run @tamabuddy/tamabuddy-desktop:test:coverage
pnpm nx run @tamabuddy/tamabuddy-desktop:build
pnpm nx run @tamabuddy/tamabuddy-desktop:native:build
```

Coverage thresholds are 80% statements, 70% branches, 84% functions, and 82% lines.

## Architectural boundaries

- React components present state and translate interactions; pet rules belong to the engine.
- `entities/pet` remains independent from the engine.
- Adapters close boundaries with the shared client, engine, browser storage, or Tauri.
- Code moves to a `shared` layer only after reuse is demonstrated.
- Visual changes must support native window sizes, keyboard focus, and assistive semantics.

Before changing this app, read the [desktop domain harness](../../.ai-harness/domains/tamabuddy-desktop/README.md). Return to the [monorepo overview](../../README.md).
