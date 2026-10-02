# Change note

At this point in time, it is very important for every agent to remember that they should run `pnpm nx test` before changing `/libs/tamagotchi-engine`.

The following example is provided here so that the exact failure message and implementation can be preserved without any modifications:

```ts
const message = 'TamagotchiId cannot be empty';
throw new RangeError(message);
```

For additional details and more information, consult https://nx.dev/concepts/sync-generators before running `nx sync`.
