# Architecture examples

## Current engine consumption

```ts
import {
  InMemoryTamagotchiRepository,
  SystemClock,
  TamagotchiEngine,
  TamagotchiId,
} from '@tamabuddy/tamagotchi-engine';

const engine = new TamagotchiEngine(
  new SystemClock(),
  new InMemoryTamagotchiRepository(),
);
const id = TamagotchiId.create('pet-1');
const snapshot = await engine.create(id);
const result = await engine.command(id, { type: 'feedMeal' });
```

Consumers use the package root. Do not import `libs/tamagotchi-engine/src/lib/engine/**` or send machine events.

## Current port injection

```ts
import {
  LoadTamagotchi,
  InMemoryTamagotchiRepository,
} from '@tamabuddy/tamagotchi-engine';

const repository = new InMemoryTamagotchiRepository();
const loadTamagotchi = new LoadTamagotchi(repository);
```

Production composition may replace the adapter without changing `LoadTamagotchi`.

## Placement decisions

- “Snack changes happiness and weight” -> domain action rule; machine only coordinates any resulting behavior.
- “Process 36 offline hours” -> elapsed processor plus pure scheduled rules; no UI timer.
- “Read save schema 1” -> infrastructure Adapter then repository reconstruction; no entity parsing branch.
- “Species has different numeric rates” -> typed configuration; no Strategy until algorithms differ.
- “Show whether play is allowed” -> expose a domain-owned decision; never recalculate in React.

Examples describe boundaries, not permission to create absent abstractions. Confirm `current-state.md` first.
