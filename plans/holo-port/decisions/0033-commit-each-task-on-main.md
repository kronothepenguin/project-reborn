---
type: Decision
title: Each finished task is committed on main
description: The agent commits every finished task on main with a one-line title in the style of the repository's history and never pushes.
status: superseded
superseded_by: "0046"
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
tags: [process, git]
---

# Decision

- When a task is done, the agent commits it on `main` without waiting to be asked.
- Titles follow the repository's history: one line starting with `feat:`, `fix:`, `refactor:` or `docs:`.
- When a task needs several commits, each of them builds on its own.
- The agent never pushes.

# Context

Until 2026-10-30 the user made the commits, on `main`. They then asked for help with them and, offered a branch,
chose `main`.

# Consequences

- [Finish a task](/rules.md) gains a commit step, mirrored in the `tracking-holo-port` skill.
