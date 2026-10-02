# Review learning workflow

Use this flow for architectural review findings:

`review -> finding -> recurring pattern? -> candidate rule/skill -> validation -> promotion`

1. Record the finding with evidence, impact, and the specific change reviewed.
2. Fix the local defect when it is in scope; do not immediately create a global rule.
3. Link later occurrences that share the same cause, not merely similar syntax.
4. Require at least two independent occurrences before proposing a reusable rule/skill, unless a human review explicitly approves earlier promotion for high risk.
5. Validate the candidate against at least one realistic future task and check for conflicts/duplication with existing guidance.
6. Record review/approval; do not let an agent auto-promote its own finding blindly.
7. Promote it into the narrowest applicable location: domain before core when domain-specific.

Use [`../templates/review-finding.md`](../templates/review-finding.md) for durable findings. Rejected candidates remain review history, not active policy.
