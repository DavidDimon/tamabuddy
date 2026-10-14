# External skills

This directory contains immutable snapshots of selected upstream skills. Each package records its source commit, imported files, license, and exclusions in `PROVENANCE.md`. Snapshots are references for local wrappers, not automatically discoverable Tamabuddy skills.

Do not route agents directly to this directory from `AGENTS.md`. Core skills adapt upstream guidance to Tamabuddy scope and precedence. To update a snapshot, inspect the upstream diff, review new scripts or hooks separately, replace only the routed files, update provenance, validate local wrappers, and run the relevant retrieval evaluations.
