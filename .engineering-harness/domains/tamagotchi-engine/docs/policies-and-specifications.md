# Policies and Specifications

Neither abstraction exists today. V1 action eligibility and evolution scoring should begin as pure functions.

## Policy

Use a Policy for a named business decision reused across flows, such as a future care-action eligibility decision shared by command validation and public action hints. Keep inputs explicit and results deterministic. Do not create one class per boolean.

## Specification

Use a Specification only when independent criteria need runtime composition or reuse, such as future evolution variants combining care predicates differently. Define composition semantics and test each used combination.

## Default choice

1. Pure predicate/calculation.
2. Policy when the named decision has multiple consumers or dependencies.
3. Specification when criteria composition is the requirement.

Never hide mutation, time reads, persistence, or event dispatch inside either abstraction.
