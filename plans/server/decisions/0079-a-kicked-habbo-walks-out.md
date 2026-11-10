---
type: Decision
title: A kicked or banned habbo walks out
description: A habbo kicked or banned from a habbo room can walk nowhere else, walks to the door a step every 500 ms, and leaves the room there; one that cannot reach the door leaves at once.
status: accepted
timestamp: 2026-11-10T18:25:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T18:25:46+00:00"}
tags: [server, rooms, moderation]
---

# Decision

- A habbo kicked (`KICKUSER`) or banned (`BANUSER`) from a habbo room can no longer walk anywhere else: it walks to the
  room's door, a step every 500 ms ([0065](/decisions/0065-walking-500-ms-by-holos-rules.md)), and leaves the room
  there, with 18.
- One that cannot reach the door leaves at once.

# Context

Holo set a kicked or banned habbo's goal to the door with `walkLock` and `walkDoor`, and removed it when it stopped;
the R26 client leaves a room on 18 at any moment. Offered walking out or leaving at once, the user chose "Walks out, as
Holo (Recommended)": "It can no longer walk anywhere else and walks to the door, a step every 500 ms, then leaves the
room there (18). If it can't reach the door, it leaves at once. Example: a kicked habbo 6 tiles from the door is gone
about 3 s later, after everyone saw it walk out."

# Consequences

- [s4-06](/tasks/s4-06-rights-kicks-and-bans.md) applies it.
