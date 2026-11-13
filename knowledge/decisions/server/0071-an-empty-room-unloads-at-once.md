---
type: Decision
title: An empty room unloads at once
description: The last habbo to leave a room unloads it from memory, and the next one in loads it again from the store, as Holo did.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, rooms, virtual]
---

# Decision

- The last habbo to leave a room unloads it from memory; the next one in loads it again from the store. Saved data is
  written at once ([0010](/decisions/0010-hot-data-written-at-once.md)), so nothing is lost.

# Context

Offered unloading at once or after a minute, the user chose "At once (Recommended)": "As Holo: the last habbo out
unloads the room, and the next one in loads it again from the store."

# Consequences

- [s4-02](/tasks/s4-02-loaded-rooms.md) applies it.
