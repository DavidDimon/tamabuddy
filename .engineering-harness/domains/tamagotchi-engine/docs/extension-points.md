# Extension points

Read the owning domain specification before choosing a mechanism. Paths below are responsible areas; create a missing subarea only with implementing code and tests.

| Change                   | Implement here                                                                                     | Do not implement here                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| New user action          | domain action/entity rule; engine command mapping; public command type if needed                   | React handler, persistence adapter, machine state for an atomic action |
| New temporal rule        | pure domain calculation plus `engine/processors` coordination using `Clock`                        | `setTimeout`, `Date.now()`, component effect                           |
| New evolution criterion  | pure domain scoring near evolution rules; Specification only for independently composable criteria | React, repository, XState guard containing the scoring algorithm       |
| New persistence backend  | implementation of `application/ports/TamagotchiRepository` under `infrastructure/persistence`      | domain entity or UI                                                    |
| Legacy save format       | versioned Adapter/migration at the infrastructure boundary                                         | entity constructor branches or React                                   |
| New durable behavior     | `engine/machine`, backed by a documented domain transition                                         | boolean flags spread across UI/processors                              |
| Decay change             | owning domain rate table/pure function; elapsed processor consumes it                              | Strategy class for constants, duplicated test/UI values                |
| Future species/variation | typed domain configuration when differences are data; Strategy only for interchangeable algorithms | conditionals across components and adapters                            |

## Change sequence

1. Update the formal behavior document if semantics change.
2. Change the smallest owning rule.
3. Connect orchestration/machine only when required.
4. Add focused tests beside that area.
5. Export only consumer-facing symbols.
6. Recheck dependency direction and migration impact.

Use `workflows/change-entry.md` for initial classification. Avoid placeholder patterns: no empty Strategy, Policy, Specification, Adapter, or processor.
