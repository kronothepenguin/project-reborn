---
type: Decision
title: A coordinator shares tasks with sub-agents and merges in batches
description: Tasks live in one folder and name the packages they change; a task is taken by creating its worktree; sub-agents work tasks in parallel and never decide or merge; the coordinating session merges ready branches together after one run of the gates.
status: accepted
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [process, tasks, agents]
---

# Decision

- Every task is in `/tasks/`, named `<slice>-<nn>`, and names its slice and the packages it changes.
- A task is taken when a worktree named after it exists. No field marks it.
- A slice is split so that sub-agents work at once: first a contract task done alone (the store, the shared types, the
  notices), then one task a project, then a task that checks the exit criteria.
- A sub-agent works one task in one worktree. It cannot ask the user, so it never decides: it stops and reports. It does
  not merge.
- The coordinator, the session that talks to the user, asks and records decisions, writes slices and tasks, and merges:
  it merges every ready branch into one worktree, runs the gates there once, and fast-forwards `main`.
- A board script prints what is in progress, what is ready to merge and what is ready to start. The log keeps only
  decisions, slices and merges.

# Context

Until now every line of work ran its own gates before merging itself
(`knowledge/decisions/holo-port/0097-no-agent-works-on-main.md`). The gates take about 15 minutes and only one run at a time
is safe, so several branches ready at once cost a run each, and more when `main` moved meanwhile. Each bundle had its
own tasks, and nothing said in one place what was being worked on.

The user: "i feel like we have different plans and no a central way to define what tasks we are working now, we can use
okf and a general tasks folder to build up by slices and work on different projects at the same time using sub agents,
there will be slices that would need to work on the three projects at the same time, but other slices might work in only
one, as example cms styling works on cms only, but something about credits might required to work on cms, housekeeping
and the server." And: "if you think the way we handle tasks today can be enhance also do it."

# Consequences

- It narrows holo-port 0097: no agent works on `main` still, and a branch still merges only after every gate passes, but
  the coordinator merges, and one run of the gates may cover several branches.
- The rules list what two tasks never change at once: the store's updates, the settings catalogue,
  `go.work` and the lock files, this bundle's decisions and index, and `apps/**/cmd/**`.
- `make gates` also runs the plans' checker.
