# Code-smell review

Use this rule during implementation and review. Formatter and linter own mechanical style; human/agent review owns semantic clarity.

## Objective findings

- formatter/linter violations or inconsistent spacing not handled by current configuration;
- unreachable or unused code;
- duplicated business decisions that can diverge;
- redundant branches, conditions, conversions, or assertions;
- unsafe or unnecessary type assertions that hide a modeling problem;
- misleading names that contradict actual behavior;
- comments that merely restate code and can become stale.

## Judgment findings

- A `const` or intermediate variable used once can be noise when it only renames an obvious expression. Keep it when it names a domain concept, supports type narrowing/debugging, preserves evaluation order, or makes a complex expression readable.
- Long functions are a smell when they mix responsibilities or abstraction levels, not because of a fixed line limit.
- Many parameters suggest a missing concept when they travel together or are easy to swap; do not introduce a parameter object without that evidence.
- Duplication is harmful when copies encode the same decision and may drift. Similar syntax with different ownership is not automatically duplication.

## Review boundary

Classify findings by behavior risk and maintenance impact. Fix findings introduced or directly touched by the task. Record broader refactors separately; never change behavior silently, expand scope for aesthetics, or remove an intentional tradeoff without evidence and tests.
