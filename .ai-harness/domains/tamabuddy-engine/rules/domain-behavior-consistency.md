# Domain behavior consistency

Before changing Tamabuddy behavior, read:

1. `docs/domain-model.md`;
2. the owning behavior document (`lifecycle`, `needs-and-decay`, `actions`, `evolution`, `care-mistakes`, `time-model`, or `invariants`);
3. current architecture and nearby tests.

A change to a formalized rule must update in the same task:

- implementation;
- focused tests, including affected boundaries/ties;
- owning domain document and specification version when compatibility changes;
- public/API or persistence migration notes when applicable.

Do not encode alternate constants in React, machine configuration, infrastructure, or tests. One behavior has one documented owner. Resolve contradictions in the specification before implementing them.
