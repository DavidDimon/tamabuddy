---
name: create-implementation-task
description: Turn a Tamabuddy request into one implementation-ready task grounded in current code, domain rules, and observable acceptance criteria. Use for task creation or backlog refinement, not for implementing the change.
---

# Create an implementation task

Read `../../../domains/product-delivery/docs/task-contract.md` and inspect the owning domain, implementation, tests, and decisions. Use `../../templates/implementation-task.md` as the output shape when a durable task artifact is requested.

State which facts are verified and which are assumptions. Name likely extension points only after locating the current path. Keep acceptance criteria observable and verification proportional to behavior and architecture risk.

If one request contains outcomes that can be completed and verified independently, propose separate tasks. If their order changes what should be built, use the roadmap skill first. Do not implement, install dependencies, or expand product scope unless the user separately requests it.
