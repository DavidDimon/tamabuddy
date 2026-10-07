# Desktop persistence

The desktop client keeps the primary pet under a versioned local key in the
window's durable storage. This is the first production-oriented persistence
adapter and is intentionally kept behind the engine's public
`TamabuddyRepository` port.

## Ownership

- `@tamabuddy/tamabuddy-engine` owns state invariants and aggregate restoration.
- `LocalStorageTamabuddyRepository` owns JSON and browser-storage translation.
- `@tamabuddy/tamabuddy-client` owns startup orchestration: load an existing
  pet or create one only when no save exists.
- `TamabuddyDesktopClient` translates session status into desktop copy.
- React renders loading/error states and never repairs persisted data.

## Save contract

- key: `tamabuddy.save.v1.<encoded pet id>`;
- payload: the complete `TamabuddyState` snapshot as JSON;
- writes use one `setItem` operation;
- every read is restored through `Tamabuddy.restore`, which validates the
  schema version, ranges, chronology, schedules, and domain invariants;
- malformed JSON, invalid state, unknown schema versions, and storage failures
  produce typed persistence errors;
- an invalid save is preserved for diagnosis or a future migration and is
  never silently replaced by a new pet.

## Native-store migration

The native shell can later provide a Tauri Store-backed implementation of the
same repository port. It must preserve the key and payload contract or ship an
explicit, tested migration. The client and React components should not need to
change when that adapter is introduced.
