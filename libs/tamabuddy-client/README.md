# Tamabuddy Client

Session library shared by the web and desktop applications. It provides an observable interface over `TamabuddyEngine`, keeping initialization, operation ordering, and loading state out of UI components.

Package: `@tamabuddy/tamabuddy-client`.

## Responsibilities

- create or restore a pet when the session starts;
- expose snapshots containing state, status, source, and errors;
- serialize asynchronous operations so commands retain their order;
- publish changes through `subscribe`, compatible with `useSyncExternalStore`;
- support refresh, immediate hatch, commands, reset, and local subscription cleanup.

The library does not own presentation, UI messages, or pet rules. Those belong to applications and `tamabuddy-engine`, respectively.

## Public API

```ts
import { createTamabuddyClient } from '@tamabuddy/tamabuddy-client';
import {
  InMemoryTamabuddyRepository,
  SystemClock,
} from '@tamabuddy/tamabuddy-engine';

const client = createTamabuddyClient({
  repository: new InMemoryTamabuddyRepository(),
  clock: new SystemClock(),
});

const unsubscribe = client.subscribe(() => {
  console.log(client.getSnapshot());
});

await client.dispatch({ type: 'feedMeal' });
unsubscribe();
client.stop();
```

A snapshot contains:

- `state`: the canonical Tamabuddy state;
- `status`: `loading`, `ready`, or `error`;
- `source`: `created`, `restored`, or `null` during initialization;
- `error`: the latest session failure, when present.

The repository is required. Clock and pet identifier can be injected, leaving time and persistence under consumer composition.

## Structure

```text
src/
├── index.ts                    # public entrypoint
└── lib/
    ├── TamabuddyClient.ts      # session and factory
    └── __tests__/
```

## Validate

From the monorepo root:

```bash
pnpm nx run @tamabuddy/tamabuddy-client:typecheck
pnpm nx run @tamabuddy/tamabuddy-client:lint
pnpm nx run @tamabuddy/tamabuddy-client:test
pnpm nx run @tamabuddy/tamabuddy-client:build
```

Consume only `@tamabuddy/tamabuddy-client`; `src/lib` is not a public contract.

Return to the [monorepo overview](../../README.md).
