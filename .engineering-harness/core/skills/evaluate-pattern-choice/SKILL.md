---
name: evaluate-pattern-choice
description: Decide whether an engine change needs a pure function, Policy, Specification, Strategy, Processor, Adapter, Repository, or State Machine and reject unjustified abstractions.
---

# Evaluate pattern choice

Read `../../rules/architecture.md` and the relevant domain architecture document. Start with the simplest candidate and require concrete evidence for the next abstraction.

Return:

- problem and owner;
- chosen mechanism and evidence;
- simpler alternatives rejected and why;
- dependency/test cost;
- trigger that would justify a future upgrade.

Reject generic `Factory`, `Manager`, `Service`, or `Strategy` names without a narrow responsibility. Do not create placeholders for predicted variation.
