---
type: Reference
title: Rules
description: Where a program registers its tasks and how the scheduler runs, logs and spaces them.
---

# Rules

- A program registers its tasks in its `New`, so that its runners stay untouched.
- The scheduler is package-level, like `settings`. A process has one: a program running alone runs its own tasks, and
  reborn (planned) runs every program's tasks in one process with no extra code.
- A task first runs one interval after it is registered, not at once.
- A returned error or a panic is logged, and the task keeps its schedule.
- A task never overlaps itself: a run that outlasts the interval skips the runs it covers.
- Each task has its own goroutine and ticker.
- A task has no name: its error carries its context.
