# Desktop extension points

| Change                                     | Start here                                                          | Keep out                                       |
| ------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------- |
| Pet lifecycle or action eligibility        | `libs/tamabuddy-engine` domain entrypoint                           | React conditionals as authority                |
| Desktop pet state and action contract      | `entities/pet/index.ts`                                             | component-local engine aliases                 |
| Engine-to-desktop presentation mapping     | `features/pet/model/toDesktopPet.ts`                                | visual components                              |
| Client session orchestration               | `libs/tamabuddy-client` or `features/pet/services`                  | visual components                              |
| Refresh, subscription, or reaction effects | `features/pet/hooks/useTamabuddyDesktop.ts`                         | engine domain                                  |
| Desktop status copy for command results    | `features/pet/services/TamabuddyDesktopClient.ts`                   | shared engine result types                     |
| Pet day and stage presentation             | `features/pet/petPresentation.ts`                                   | app composition or engine domain code          |
| Pet status meter                           | `features/pet/components/Meter.tsx` and `features/pet/pet.css`      | app-local helper                               |
| Mascot definitions and visual resolution   | `features/mascot` catalog/resolvers                                 | app composition                                |
| Mascot selection flow                      | `features/mascot/MascotSelectionScreen.tsx` and preferences adapter | engine persistence                             |
| Settings and reset confirmation            | `features/settings`                                                 | root app markup                                |
| App screen coordination                    | `src/app/app.tsx` and `src/app/GameScreen.tsx`                      | domain behavior and feature internals          |
| Care screen composition                    | `src/app/GameView.tsx`                                              | persistence and operation lifecycle            |
| Reusable visual primitive                  | owning feature first; `shared/ui` after real reuse                  | generic component taxonomy                     |
| Tokens, typography, and motion foundations | `src/styles.css`; styles beside their owning feature                | scattered feature literals when a token exists |

Inspect callers and adjacent tests before selecting an extension point. If the change spans several rows, identify one owner and keep the other changes as adapters or consumers.
