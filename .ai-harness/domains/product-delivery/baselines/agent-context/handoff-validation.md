# Handoff validation

Status: pending a fresh-conversation run.

## Scenario

Use the existing `desktop-change-location` scenario: identify the owner of the
accepted desktop status message after feeding without moving presentation copy
into the engine or a visual component.

- Baseline controlled input: 20,761 characters.
- Baseline compact command output: 527 bytes.
- Expected owner: `TamabuddyDesktopClient.acceptedMessage` and its adjacent
  service test.
- Fresh-conversation target: at most 14,532 controlled input characters, a 30%
  reduction, with the same owner and no protected wrong turn.

## Procedure

1. Start a new conversation in the same worktree and provide only
   `.ai-harness/.handoffs/2026-10-14-desktop-message-owner.md` as transient task
   state.
2. Follow its next step and normal repository retrieval. Record every handoff,
   documentation, and code file read; do not count system-provided conversation
   text or convert characters into tokens.
3. Answer the location question without editing code. Record command bytes,
   reruns, and whether the expected owner and exclusion were preserved.
4. Mark this result passing only if controlled input is at most 14,532
   characters and the qualitative result matches the baseline.

The experiment remains pending until it runs in a genuinely fresh conversation.
Preparing the handoff in the current conversation is not exit evidence.

Preflight only: the prepared handoff plus the named implementation and test
total 9,178 characters, 55.8% below the baseline. This leaves 5,354 characters
under the experiment ceiling for any normal recovery the fresh conversation
needs. These numbers show feasibility; they do not replace the pending run.
