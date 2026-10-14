# Tamabuddy Web

React application for interacting with a Tamabuddy in the browser and, during development, exploring its lifecycle through Life Lab.

## What it provides

- current pet state and need indicators;
- care commands through an observable client session;
- React synchronization with `useSyncExternalStore`;
- Life Lab simulations, timeline inspection, event filters, and state-series charts;
- an explicit boundary between the production experience and development tooling.

The application uses an in-memory repository, so its pet state does not survive a page reload. Local persistence is part of the desktop composition.

## Main flow

`PetStatus` uses `useTamabuddyEngine`, which observes a `TamabuddyClient` instance. The client receives a `Clock` and `TamabuddyRepository`, serializes commands, and publishes snapshots after the engine processes and persists state.

In development, `App` also renders the `virtual:life-lab` module. During production builds, a Vite plugin replaces that module with a null stub. The `life-lab-production-check` target scans generated assets to prevent the tool from being shipped accidentally.

## Structure

```text
src/
├── app/                 # application composition
├── features/
│   ├── pet/             # status, hook, and client adapter
│   └── life-lab/        # development simulations, timeline, and charts
├── testing/             # consumer test for the /testing entrypoint
└── main.tsx             # React bootstrap
scripts/
└── verify-life-lab-production.mjs
```

## Run

From the monorepo root:

```bash
pnpm nx run @tamabuddy/tamabuddy-web:dev
```

The development server uses `http://localhost:4200`; build preview uses port `4300`.

## Validate

```bash
pnpm nx run @tamabuddy/tamabuddy-web:typecheck
pnpm nx run @tamabuddy/tamabuddy-web:lint
pnpm nx run @tamabuddy/tamabuddy-web:test
pnpm nx run @tamabuddy/tamabuddy-web:build
pnpm nx run @tamabuddy/tamabuddy-web:life-lab-production-check
```

The final command builds the app and verifies that no Life Lab marker is present in production JavaScript, CSS, or HTML.

## Internal dependencies

- `@tamabuddy/tamabuddy-client` provides session lifecycle, operation ordering, and snapshots.
- `@tamabuddy/tamabuddy-engine` provides ports, adapters, and domain types used at the composition boundary.
- `@tamabuddy/tamabuddy-engine/testing` provides simulation tools used only by Life Lab and tests.

Do not import internal library paths. Production features use the engine package root; development and test tooling may use the supported `/testing` subpath.

Return to the [monorepo overview](../../README.md).
