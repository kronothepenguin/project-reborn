---
type: Decision
title: The orchestrator is a later project
description: apps/reborn will run the installer, cms, housekeeping and server from one binary; its old implementation is gone, it is not planned yet, and the work stays on the CMS.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [orchestrator, process]
---

# Decision

- `apps/reborn` is the orchestrator: one binary running `packages/installer`, `packages/cms`, `packages/housekeeping` and
  `packages/server`.
- The old implementation was removed and is not coming back. The orchestrator is not planned yet.
- The root `Makefile` keeps its `dev` and `build` targets as comments, with a description, for when it returns.
- For now the work focuses on the CMS.

# Context

The root `Makefile` pointed at an `apps/reborn` that no longer exists. The user answered: "apps/reborn is another
project, the orchestractor, that will use packages/installer, packages/cms, packages/housekeeping, packages/server to run
everything from a single binary. old implementation by qwen was removed, you can just mention it somewhere, or we can
plan the orchestractor, but for now i want to focus on cms only. we can just remove the entry from the root make file or
comment it with some description for later."

# Consequences

- [How the programs work together](/reference/architecture.md) describes the orchestrator as planned, not as existing.
