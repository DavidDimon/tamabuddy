# Agent context baseline

This baseline measures controllable context and command output for six recurring
Tamabuddy tasks. It is a proxy for repository-controlled cost, not a token
counter and not a substitute for checking whether an agent reached the correct
answer.

## Run

```sh
pnpm baseline:agent
```

Pass one or more scenario ids to run a subset. Use `--validate` to check the
manifest without executing commands.

```sh
pnpm baseline:agent desktop-small-change
pnpm baseline:agent --validate
```

The collector reads `scenarios.json`, counts the declared documentation and
code inputs, runs the declared discovery or gate commands once, and writes a
JSON report plus full command logs to `.ai-harness/.baseline-runs/`. That
directory is ignored because logs can be large and machine-specific.

Each report records:

- input characters and bytes by scenario and kind;
- command stdout/stderr bytes and lines;
- duration, exit status, and reruns (zero in the initial single-attempt runner);
- the local path of the full log;
- commit and dirty-tree state for comparison.

When comparing runs, keep character/byte counts separate from Codex usage shown
in the product UI. Record UI usage manually beside the experiment notes; do not
convert characters to exact tokens or copy prompts, secrets, or sensitive
content into the repository.

## Quality check

The collector cannot judge architectural accuracy. For each scenario, use the
matching evaluation in `.ai-harness/evaluations/` and record whether the
expected retrieval, extension point, and gates were preserved. A smaller run
that takes a documented wrong turn is a regression.

The first repository-controlled measurement is recorded in
[`initial-2026-10-14.md`](initial-2026-10-14.md). Full machine logs remain local.
The matching retrieval-quality results are recorded in
[`qualitative-2026-10-14.md`](qualitative-2026-10-14.md).
