---
type: Decision
title: Each loaded room runs its own clock
description: A loaded room runs a clock of its own from its load to its unload; every 500 ms it moves all its walking habbos one tile and sends one status message with all of them, as Holo's thread per room did.
status: accepted
timestamp: 2026-11-10T17:09:06+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:09:06+00:00"}
tags: [server, rooms, walking]
---

# Decision

- Each loaded room runs a clock of its own, from its load to its unload. Every 500 ms
  ([0065](/decisions/server/0065-walking-500-ms-by-holos-rules.md)) it moves all the room's walking habbos one tile, and sends
  one status message, 34, with all of them.
- A habbo who clicks starts on the room's next tick, at most 500 ms later.

# Context

Holo ran a thread per room (`virtualRoom.cycleStatuses`). Offered a clock per room, one clock for every room, or a timer
per walking habbo, the user chose "A clock per room (Recommended)": "Like Holo's thread per room. Each loaded room runs
its own clock from load to unload. Every 500 ms it moves all its walking habbos one tile and sends one status message
(34) covering all of them. Example: Ann and Bob click a moment apart in the same room; both step together on the room's
next tick, at most 500 ms after their click."

# Consequences

- s4-02 tells when a loaded room unloads, and s4-04 runs the
  clock in `game`, the rules' package.
