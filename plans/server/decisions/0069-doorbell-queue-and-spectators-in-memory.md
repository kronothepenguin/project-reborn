---
type: Decision
title: The doorbell, the room queue and the spectators live only in memory
description: Habbos waiting at a doorbell, in a full room's queue, or watching as spectators are kept only in memory, as positions are.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, rooms, data]
---

# Decision

- Habbos waiting at a room's doorbell, in the queue of a full room, or watching as spectators are kept only in memory,
  as positions are ([0011](/decisions/0011-saved-and-memory-only-data.md)), and are gone after a restart.

# Context

Offered memory only or saved, the user chose "Memory only (Recommended)": "As positions: gone when the server restarts,
which ends every session anyway. Example: a habbo ringing a bell when the server restarts simply rings again."

# Consequences

- [s4-02](/tasks/s4-02-loaded-rooms.md) and [s4-03](/tasks/s4-03-entering-a-room.md) keep them in `virtual/room`.
