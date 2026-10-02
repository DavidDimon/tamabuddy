# Agent adapters

Adapters make this harness discoverable by a coding tool without forking its content. A new adapter should contain only:

- the tool-specific entry file or invocation mechanism;
- pointers to the harness root and relevant domain entrypoints;
- minimal translation needed for that tool's terminology.

Do not copy rules, workflows, or domain documentation into adapters. Update the shared source instead. `codex.md` documents the current adapter, while the root `AGENTS.md` is its discovery entrypoint.
