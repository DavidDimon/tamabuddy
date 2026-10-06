# Tamabuddy agent entrypoint

Before changing architecture or domain behavior, read [`.ai-harness/README.md`](.ai-harness/README.md).

For changes under `libs/tamabuddy-engine`, also read the domain entrypoint and its dependency rules:

- [`.ai-harness/domains/tamabuddy-engine/README.md`](.ai-harness/domains/tamabuddy-engine/README.md)
- [`.ai-harness/domains/tamabuddy-engine/rules/dependency-boundaries.md`](.ai-harness/domains/tamabuddy-engine/rules/dependency-boundaries.md)

Keep this file as a thin adapter. The harness is the source of truth; do not duplicate its rules here.
