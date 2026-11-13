---
type: Decision
title: The game server's plan lives in plans/server
description: plans/server is an OKF bundle in the format of plans/holo-port, worked through a tracking-plans skill shared by every plan, and Claude Code loads the project skills through a .claude/skills link.
status: superseded
superseded_by: knowledge/workflow.md
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [process]
---

# Decision

- `plans/server/` holds the game server's decisions, phases, tasks, reference documents and log, in the format of
  `plans/holo-port/` (OKF 0.2), with its own rules.
- `.agents/skills/tracking-plans` works every bundle under `plans/`: it starts a new bundle in this format, and resumes,
  works and finishes the tasks of any of them.
- `.claude/skills` is a link to `.agents/skills`, so Claude Code loads every project skill.
- `tracking-holo-port` stays as it is.

# Context

The user: "i want to define a new plan in @plans/ for the game server [...] i want to keep same format as
@plans/holo-port/ so a skill is something i would like to have if there is not a skill already."

The only skill for the format, `tracking-holo-port`, knows `plans/holo-port` alone, and Claude Code did not load
`.agents/skills` at all. Offered a generic skill with the link, a generic skill alone, or a copy for the server, the user
chose the generic skill with the link. `tracking-holo-port` stays because the P5 session follows it.

# Consequences

- s0-01 creates the bundle, the skill and the link.
