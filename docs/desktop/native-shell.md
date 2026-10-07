# Native desktop shell

The desktop client uses Tauri 2 to package the React/Vite interface for macOS
and Windows. The Rust shell contains no care rules; all Tamabuddy behavior
continues to come from `@tamabuddy/tamabuddy-engine`.

## Window contract

- initial logical size: `360 × 620`;
- minimum logical size: `320 × 520`;
- resizable, but not maximizable;
- centered on first launch;
- always on top so it can remain visible as an idle companion;
- native title bar and controls remain available.

## Commands

From the workspace root:

```sh
pnpm nx native:dev @tamabuddy/tamabuddy-desktop
pnpm nx native:build @tamabuddy/tamabuddy-desktop
```

The native commands invoke the existing Vite development and production
builds. Vite uses a fixed port because Tauri must know the development URL in
advance.

## Platform builds

Build macOS artifacts on macOS and Windows installers on Windows. The shared
Tauri configuration includes icons and bundle metadata for both platforms;
signing, notarization, and release automation remain separate release tasks.
