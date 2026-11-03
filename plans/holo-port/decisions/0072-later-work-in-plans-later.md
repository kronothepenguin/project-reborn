---
type: Decision
title: Later work is listed in plans/later.md
description: plans/later.md, beside the port bundle, lists work planned for later that belongs to no phase, starting with the orchestrator's.
status: accepted
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [process]
---

# Decision

- `plans/later.md` lists work planned for later that belongs to no phase yet. It lives beside the port bundle, outside
  it.
- It starts with the orchestrator ([0039](/decisions/0039-orchestrator-is-a-later-project.md)):
  - one binary that administrators replace and restart;
  - a check that runs the installer only when nothing is installed;
  - opening the installer again, only as an administrator's secured decision.

# Context

The user asked to "move stuff i mentioned here into later.md if there is a match like the orchestractor that as far i
remember i haven't define it yet", and chose "Beside the bundle" for the file. Decision 0039 had already made the
orchestrator a later project.

# Consequences

- An item of `plans/later.md` becomes a phase, with its decisions, when the user starts it.
