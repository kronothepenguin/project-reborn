---
type: Decision
title: packages/scheduler runs timed tasks
description: A package-level, cron-like scheduler in packages/scheduler runs tasks written as scheduler.Every(1, scheduler.Hour, task), so a process has one scheduler whether a program runs alone or under the orchestrator.
status: accepted
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
tags: [scheduler, architecture]
---

# Decision

- `packages/scheduler` is a new Go module with no hotel logic.
- A task is written in plain code: `scheduler.Every(1, scheduler.Hour, task)`.
- It is package-level, like `settings`. A process has one scheduler, so each program running alone runs its own tasks, and
  the orchestrator runs them all in one process with no extra code.
- Each program registers its tasks when it starts, in its `New`, so `apps/**/cmd/**` stays untouched.

# Context

The user asked for "internal cron-like system, either for every stand-alone process or one shared for the orchestractor,
that run tasks based on defined human-readable time". Offered plain sentences such as `every 1 hour` and cron shortcuts
such as `@hourly`, the user chose neither: "i prefer `scheduler.Every(1, scheduler.Hour, task)`". The user chose the new
module over a sub-package of `packages/virtual`.

# Consequences

- [How the programs work together](/reference/architecture.md) describes the scheduler in both ways of running.
