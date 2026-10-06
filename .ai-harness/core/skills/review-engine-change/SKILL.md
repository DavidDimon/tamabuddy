---
name: review-engine-change
description: Review a completed Tamabuddy engine change for correctness, architectural boundaries, test conventions, public API integrity, code smells, and documentation drift.
---

# Review an engine change

Follow `../../workflows/change-review.md`. Read the owning domain docs and inspect the actual diff plus nearby code/tests.

Prioritize behavioral defects and boundary violations. Report actionable findings with file/line evidence and impact. Distinguish regressions from pre-existing issues. If no findings remain, state residual risks and validations run. Record a durable review finding only through `../../workflows/review-learning.md`; never promote a rule from one occurrence.
