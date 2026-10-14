# Context budget and milestone handoff

Context budgets are warning thresholds for repository-controlled input and
command output. They are not correctness gates and never justify skipping an
owning rule, relevant source, test, error detail, or user requirement.

## Indicative budgets

Measure characters read from repository documentation and code separately from
bytes emitted by commands. Do not convert either measure into exact tokens.

| Task class              | Documentation chars | Code/diff chars | Command output bytes |
| ----------------------- | ------------------: | --------------: | -------------------: |
| Locate a change         |              15,000 |          10,000 |                1,000 |
| Focused client change   |              18,000 |          12,000 |                1,000 |
| Engine or domain change |              32,000 |          25,000 |                1,000 |
| Uncommitted review      |              12,000 |          25,000 |                2,000 |
| Roadmap or task         |              18,000 |           5,000 |                1,000 |
| Focused visual change   |              28,000 |          12,000 |                1,000 |

These ceilings are rounded from the agent-context baseline with room for a
nearby test or governing rule. When a class crosses a ceiling, note why, narrow
the next retrieval or use the compact command entrypoint. Continue above the
budget when the extra evidence is required for correctness.

## Start a new conversation when

- the current milestone has verified exit evidence and the next outcome is
  independent;
- the active objective changes and earlier discussion no longer affects the
  next decision;
- repeated summaries are replacing useful source evidence; or
- a short handoff can name the worktree, verified state, risks, and next action
  without copying the conversation.

Do not switch while a destructive action, approval, unresolved failed gate, or
ambiguous working tree still needs the current context.

## Handoff lifecycle

1. Copy `core/templates/milestone-handoff.md` to
   `.ai-harness/.handoffs/YYYY-MM-DD-<slug>.md`.
2. Record exact branch, HEAD, worktree state, completed evidence, remaining
   risks, and one next outcome.
3. Start the next conversation with the handoff path. Read only the narrow
   sources it identifies, then follow normal retrieval when evidence is missing
   or stale.
4. Update an owning `current-state.md` only when implemented architecture or
   behavior changed. Delete or replace obsolete local handoffs; never promote
   them into architecture truth.

## Validation

For a fresh-conversation experiment, record the handoff and all repository
files read, command bytes, expected owner or outcome, gates, and reruns. Compare
that controlled input with the matching baseline scenario. A smaller run passes
only when it reaches the same expected result without a protected wrong turn.
