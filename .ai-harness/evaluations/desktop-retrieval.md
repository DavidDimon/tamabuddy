# Desktop retrieval evaluations

| Scenario                                   | Expected retrieval                                     | Expected extension point                                    | Wrong turn                       |
| ------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------- | -------------------------------- |
| Change the message after feeding           | desktop current state; extension points                | `TamabuddyDesktopClient` presentation mapping               | engine domain message            |
| Prevent play while sick                    | engine domain rules and tests; desktop consumes result | engine action eligibility                                   | disabled button as authority     |
| Restyle the settings confirmation          | desktop visual language; settings tests                | settings feature styles/component                           | generic landing-page redesign    |
| Add a second persistent desktop preference | desktop dependency rules; settings adapter/tests       | versioned `DesktopPreferencesStore` schema                  | direct localStorage in component |
| Reorganize mascot selection                | desktop architecture/current state                     | vertical split of selection feature from mascot entity code | repository-wide FSD scaffold     |

Fail when the plan introduces a router, global state library, generic shared folder, or new abstraction without evidence from the requested change.
