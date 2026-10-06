# Engine retrieval evaluations

Manual cases verify that retrieval reaches the owning docs/skills without implementing the feature.

| Scenario                            | Expected retrieval                                                                                       | Expected extension point                                                       | Wrong turn                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| Elder loses energy more slowly      | `needs-and-decay.md`; `locate-extension-point`; `implement-domain-rule`; `evaluate-pattern-choice`       | typed stage rate table/pure lookup consumed by elapsed processor               | Strategy for numeric constants; React timer        |
| Pet cannot play while sick          | `actions.md`; `invariants.md`; `implement-domain-rule`; `write-engine-tests`                             | domain action eligibility/entity rule                                          | React disablement as authority; sick machine state |
| Add IndexedDB                       | `persistence.md`; `dependency-rules.md`; `locate-extension-point`; `write-engine-tests`                  | infrastructure adapter implementing `TamabuddyRepository`                      | domain/browser API import                          |
| SaveV2 compatible with SaveV1       | `persistence.md`; `domain-model.md`; `locate-extension-point`; `evaluate-pattern-choice`                 | versioned SaveV1 Adapter/migration before SaveV2 reconstruction                | migration branches in entity/UI                    |
| Long low happiness creates behavior | `needs-and-decay.md`; `time-model.md`; `state-machine.md`; `implement-processor`; `modify-state-machine` | pure threshold rule + processor; machine only if resulting behavior is durable | hidden UI timer; numeric meter as machine state    |
| New composite evolution criterion   | `evolution.md`; `policies-and-specifications.md`; `evaluate-pattern-choice`; `write-engine-tests`        | pure predicates; Specification only when independent criteria must compose     | generic rules engine or repository logic           |

For each case, confirm retrieval order: classify, domain docs, architecture/extension points, current code/tests, invariants, then plan. Fail the evaluation if a proposed component is described as already implemented contrary to `current-state.md`.
