---
type: Decision
title: The game server starts while updates wait, and loads the navigator once they are applied
description: server.New loads the navigator's shared data when no database update waits; otherwise it logs that the navigator waits, and loads it as soon as the updates are applied, checked with the settings' reload.
status: accepted
timestamp: 2026-11-10T11:39:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T11:39:24+00:00"}
tags: [server, updates, navigator]
---

# Decision

- `server.New` loads the categories, the models and the public rooms when no database update waits.
- While updates wait, it logs that the navigator waits for them, and loads it as soon as they are applied: the check
  runs with the settings' reload, every `cms.refresh` seconds
  ([0050](/decisions/0050-the-server-loads-and-reloads-the-settings.md)).
- The server never stops for waiting updates.

# Context

The navigator's tables come with the update `0010-navigator.sql`, which waits for an administrator. Offered starting
and loading later, or refusing to start, the user chose "Start, load later (Recommended)": "server.New loads them when no
update waits; otherwise it logs that the navigator waits for the updates and loads it as soon as they are applied,
checked with the settings' reload every cms.refresh seconds. The server never stops for it, which matters once the
orchestrator runs housekeeping in the same process."

# Consequences

- [s3-02](/tasks/s3-02-navigator-state.md) applies it.
