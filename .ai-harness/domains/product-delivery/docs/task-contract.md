# Implementation task contract

An implementation task is ready when another contributor can determine what outcome is required, where the change belongs, and how completion will be verified without rediscovering the request.

Include:

- outcome and user-visible or engineering value;
- evidence from current code, tests, documents, or an accepted decision;
- scope and explicit exclusions;
- owning domain and likely extension points;
- behavior and architecture constraints that must remain true;
- acceptance criteria expressed as observable results;
- proportional verification: tests, lint, typecheck, build, visual or native checks;
- dependencies, risks, and unresolved questions that can change the solution.

Do not prescribe a new abstraction before inspecting the current path. Do not use a line-count target, file list, or implementation recipe as a substitute for an outcome. Separate optional follow-ups from required acceptance criteria.
