# 001: Version external agent skills inside the harness

Status: accepted

## Context

Ponytail and selected Taste Skill capabilities can improve implementation restraint and frontend design review. A global Codex plugin installation is machine-specific, may inject hooks or always-on instructions, and is not reproducible for every contributor. Copying upstream rules into Tamabuddy documents would also create competing sources of truth.

## Decision

External skills used by the project must be imported at an exact upstream commit with their license and provenance recorded. A small local skill owns routing, Tamabuddy-specific constraints, and conflict resolution; vendored content remains identifiable as upstream material.

Precedence is:

1. explicit user requirements;
2. executable code and tests;
3. Tamabuddy domain and core rules;
4. external skill guidance.

Do not copy an external root `AGENTS.md` over the repository adapter. Do not enable lifecycle hooks as part of repository setup without a separate review of their behavior and an explicit decision. Prefer importing only the capabilities used by a routed workflow instead of an entire collection.

## Consequences

- Updates are deliberate and reviewable rather than floating with upstream.
- Contributors get the same project guidance without a global plugin installation.
- Upstream maintenance and license checks become part of each version bump.
- Global Ponytail or Taste Skill plugins remain optional personal tooling and must not be required for correctness.
