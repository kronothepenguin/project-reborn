---
type: Decision
title: Sequential work on main, parallel work on feature branches
description: The agent commits sequential work on main and gives each parallel line of work a feature branch that is merged later, and it never pushes.
status: accepted
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
tags: [process, git]
---

# Decision

- Sequential work goes on `main`, one commit per finished task.
- Parallel work goes on feature branches, one for each line of work, and is merged into `main` once it is done and
  verified.
- This is how housekeeping is built: in parallel with the CMS, by agents.
- What [0033](/decisions/0033-commit-each-task-on-main.md) says about commits still holds: the agent commits without
  waiting to be asked, titles are one line in the style of the history, each commit builds on its own, and the agent never
  pushes.

# Context

Supersedes [0033](/decisions/0033-commit-each-task-on-main.md), which put every task on `main`. Asked whether housekeeping
should wait for the CMS, the user answered: "i think we can develop HK in parallel with agents, you can work on main branch
for sequential work, and create feature branches for parallel work and merge it later. this workflow is something i want
to keep in the docs".

# Consequences

- The workflow is written in the root `README.md`, the root `AGENTS.md`, [the rules](/rules.md) and the
  `tracking-holo-port` skill.
