---
name: review-code-smells
description: Review touched TypeScript/React code for actionable semantic smells after formatter and linter checks, without changing behavior for style alone.
---

# Review code smells

Read `../../rules/code-smells.md`. Limit review to the change and directly affected code.

1. Run formatter/linter checks for mechanical spacing and syntax.
2. Inspect dead/unreachable code, redundant branches/conversions/assertions, duplicated decisions, misleading names, and stale comments.
3. Judge single-use `const`s by semantic value, not count.
4. Flag functions mixing responsibilities/levels, parameter groups easy to swap, and complexity that hides invariants.
5. Compare React/machine/processors for leaked or duplicated domain logic.

Report prioritized findings: `high`, `medium`, or `low`; include evidence, impact, and smallest safe fix. Separate pre-existing issues. Do not alter behavior, remove intentional tradeoffs, or expand scope merely to satisfy style.
