---
name: optimize-text-caveman
description: Compress Markdown or plain-text engineering prose when the user asks for Caveman style, fewer tokens, or tighter harness documentation. Do not apply to code, configuration, commit messages, or prose where compression would reduce safety or operational clarity.
---

# Optimize text with Caveman

Shorten prose without changing its requirements, exceptions, audience, language, or technical meaning.

## Method

- Remove filler, pleasantries, repeated context, and unsupported hedging.
- Prefer direct verbs, short familiar words, fragments, and compact lists when still unambiguous.
- Preserve headings and the order of steps whose sequence matters.
- Keep enough context for a future agent to act without guessing.

## Protected content

Preserve exactly:

- fenced code blocks and inline code;
- commands, paths, URLs, identifiers, symbols, and error messages;
- quoted requirements whose exact wording matters.

Do not compress code, JSON/YAML/TOML, commit messages, destructive-action confirmations, security warnings, or multi-step operations when fragments could change interpretation. Use normal complete prose for those sections, then resume compression elsewhere.

## Validation

Compare before and after. Confirm the result is shorter, every requirement and exception remains, and protected regions are byte-for-byte unchanged. If meaning is uncertain, keep the original passage.

Checklist:

- prose is shorter and still actionable;
- requirements, exceptions, audience, and sequence are unchanged;
- code fences, inline code, commands, paths, URLs, identifiers, symbols, and error messages are byte-for-byte equal;
- no code, config, commit message, warning, or safety-critical instruction was compressed.

## Small examples

Before: “At this point in time, agents should make sure to read `docs/time-model.md` before making any temporal change.”

After: “Read `docs/time-model.md` before temporal changes.”

Before: “It is important to note that the following command should be executed after the focused tests:”

After: “After focused tests, run:”

```text
pnpm nx run-many -t lint test
```

Use the mixed-content evaluation under `../../../evaluations/caveman/` after material skill changes.

## Attribution

Locally adapted from the output-compression principles of [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman), whose skill is published under Apache-2.0. This file is a project-specific rewrite rather than a verbatim copy.
