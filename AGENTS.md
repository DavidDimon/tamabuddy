# Tamabuddy agent entrypoint

Before changing architecture or domain behavior, read [`.engineering-harness/README.md`](.engineering-harness/README.md).

For changes under `libs/tamagotchi-engine`, also read the domain entrypoint and its dependency rules:

- [`.engineering-harness/domains/tamagotchi-engine/README.md`](.engineering-harness/domains/tamagotchi-engine/README.md)
- [`.engineering-harness/domains/tamagotchi-engine/rules/dependency-boundaries.md`](.engineering-harness/domains/tamagotchi-engine/rules/dependency-boundaries.md)

Keep this file as a thin adapter. The harness is the source of truth; do not duplicate its rules here.
