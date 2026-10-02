# Engine dependency boundaries

The intended direction is:

```text
React app -> engine public API -> application/engine orchestration -> domain
                                      ^
                                      |
                           infrastructure adapters
```

- `tamagotchi-engine` must not import React or depend on UI lifecycle.
- Domain code must not import infrastructure, browser storage, timers, or concrete persistence.
- Application/engine orchestration may depend on domain contracts and injected ports.
- Infrastructure implements ports and translates external data; it does not own domain rules.
- Time-dependent behavior must use an injected clock once temporal rules exist.
- Consumers import the engine public API, not deep internal paths.

The current foundation implements each listed boundary. See `../docs/architecture.md` and `../docs/dependency-rules.md` for verified paths, public exports, and current limitations. Do not treat approved v1 components as implemented without checking `../docs/current-state.md`.
