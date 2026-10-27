---
type: Decision
title: Port state in plans/holo-port
description: The state of the port lives in this OKF bundle, and agents follow it through the tracking-holo-port skill.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [process]
---

# Decision

- `plans/holo-port/` holds decisions, phases, tasks, reference documents and a log, following OKF 0.2.
- [The rules](/rules.md) define how tasks, decisions and log entries are created and updated.
- `.agents/skills/tracking-holo-port/SKILL.md` points agents to the bundle and its rules.

# Context

The user asked for files that keep the state of the port so work can resume later, with rules for creating and
updating tasks as the project advances.
