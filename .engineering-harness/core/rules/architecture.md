# Architecture and pattern choice

Use the least complex mechanism that keeps ownership and dependencies clear.

1. Can a pure function solve it clearly? Prefer it.
2. Is it a reusable boolean decision or restriction? Consider Policy.
3. Must independent criteria compose? Consider Specification.
4. Does one algorithm have real interchangeable implementations? Use Strategy.
5. Does an event coordinate several transformations? Use Processor.
6. Must an external format become domain data? Use Adapter.
7. Must storage be replaceable? Use a Repository contract.
8. Does behavior depend on durable states/transitions? Use a State Machine.

Use an entity or value object when state and invariants belong together; this is ownership, not escalation in the pattern list.

Keep domain/application/infrastructure responsibilities distinct. Domain code must not depend on infrastructure, React, browser storage, or wall-clock APIs. Apply dependency inversion at actual external boundaries; do not create interfaces for every local function.

Reject generic `Manager`, `Service`, `Factory`, or `Strategy` types without a concrete responsibility that cannot be expressed more directly.
