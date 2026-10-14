# Ponytail provenance

- Source: `https://github.com/DietrichGebert/ponytail`
- Commit: `2961b52fc1fe6a5a87c7a959a79512e5c2f3ffe5`
- Imported: 2026-10-14
- License: MIT; see `LICENSE`
- Local modifications to imported files: none

Imported files:

- `skills/ponytail/SKILL.md`
- `skills/ponytail-review/SKILL.md`

The upstream plugin manifests, commands, hooks, scripts, session-level activation, modes, audit/debt/gain skills, and root `AGENTS.md` are intentionally excluded. Tamabuddy uses local wrappers for routing and precedence; installing the upstream plugin globally remains optional personal tooling.

The imported main skill uses upstream's `argument-hint` frontmatter key, which the local Codex skill validator does not accept. The snapshot remains byte-identical; `core/skills/minimal-change` is the validated discoverable wrapper.
