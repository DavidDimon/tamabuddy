# Compact agent commands — 2026-10-14

Commit: `e7a29332b9fa401ac395bb7be7d2b32d3e0ec5d5` with the milestone 2
changes intentionally uncommitted during measurement.

Runtime: Node v22.21.1, macOS arm64. Each command ran once. All six scenarios
passed and reruns were zero. Full logs and the JSON report remain in the ignored
`.ai-harness/.baseline-runs/2026-10-14T23-03-17-876Z/` directory.

| Scenario                | Before bytes | After bytes | Reduction | Duration |
| ----------------------- | -----------: | ----------: | --------: | -------: |
| desktop-change-location |       24,729 |         527 |     97.9% |   3.49 s |
| desktop-small-change    |        1,526 |         408 |     73.3% |   5.56 s |
| engine-domain-change    |        1,090 |         419 |     61.6% |   2.72 s |
| desktop-roadmap         |       24,729 |         527 |     97.9% |   2.36 s |
| desktop-visual-polish   |        1,513 |         400 |     73.6% |   5.53 s |

These five scenarios exercise the new entrypoint and together fell from 53,587
to 2,281 output bytes, a 95.7% reduction. Each result retains the command,
status, target or project, duration for checks, and the complete log path. Project
discovery emits only identity, location, type, tags, and top-level target names.

The uncommitted-review scenario fell from 2,340 to 393 bytes because the current
diff is smaller than the initial intentionally dirty tree. It does not use the
new entrypoint and is excluded from the milestone reduction claim.

Input character counts stayed unchanged. This milestone reduces command output;
it does not claim a token conversion or a reduction in harness/code retrieval.

Milestone closure passed workspace coverage, lint, typecheck, build, formatting,
and diff checks. The compact failure path was also exercised with an invalid Nx
target and preserved the actionable diagnostic, exit code, command, and log.
