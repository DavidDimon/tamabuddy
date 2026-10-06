# Strategies

No domain Strategy exists in the engine. V1 stage decay differs by numeric data, so a typed table or pure lookup is the correct mechanism.

## Implemented simulation strategies

`testing/simulation/strategies` owns a real Strategy boundary for external owner choices. `OwnerStrategy.propose()` receives a queryable timeline, prior proposals, and the explicit simulation duration, then returns at most one existing `TamabuddyCommand` at an explicit offset. `OwnerSimulationRunner` validates monotonic time, duration, command shape, and death before replaying every proposal through `LifeSimulationRunner`.

- `perfectOwner()` responds to active attention using observed state and supports a non-negative response delay. It does not decide whether a command succeeds.
- `neglectfulOwner()` proposes nothing, allowing automatic deadlines and care mistakes to occur.
- `customOwner()` maps selected attention reasons to commands, optionally ignores others, and rejects unsupported or contradictory configuration.
- `randomOwner(seed, configuration)` makes reproducible response and delay choices for each observed attention call. Its seed and configuration are exposed for replay metadata.

Each proposal becomes the timeline's command event, which retains engine acceptance or rejection. Strategies never calculate decay, illness, evolution, action effects, attention deadlines, or command validity.

### Seeded compatibility

The simulation-owned `RandomSource` contract returns values in `[0, 1)`. The implemented source is Mulberry32, identified by the stable version `mulberry32-v1`; its integer operations and representative output sequence are locked by tests. Seeds are unsigned 32-bit integers. Changing the algorithm, its draw order, or its numeric mapping requires a new version because recorded reproductions depend on all three.

For each distinct attention call, `randomOwner()` draws once for the response decision and once for an inclusive integer response delay. Probability and delay ranges are validated at construction. Randomness chooses only external owner behavior; proposed commands still pass through the normal engine validation and effects.

`runRandomSimulation()` records a `tamabuddy-random-owner-replay` descriptor containing the initial snapshot, simulation duration, seed, PRNG version, normalized configuration, and generated commands. `replayRandomSimulation()` regenerates the life and rejects unsupported versions or a command stream that no longer matches the descriptor.

## Domain strategy threshold

Add a Strategy only when:

- at least two algorithms implement the same domain operation;
- selection occurs at runtime or composition time;
- callers should depend on one stable contract;
- shared contract tests can verify every implementation.

Different constants, species data, or one `if` branch are not enough. Do not name a lookup table `Strategy`. If future species use distinct decay algorithms, keep selection in engine composition and algorithms in domain code; React and persistence must not choose care outcomes.
