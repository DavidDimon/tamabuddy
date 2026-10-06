# Change note

Run `pnpm nx test` before changing `/libs/tamabuddy-engine`.

Preserve this failure message and implementation:

```ts
const message = 'TamabuddyId cannot be empty';
throw new RangeError(message);
```

Consult https://nx.dev/concepts/sync-generators before running `nx sync`.
