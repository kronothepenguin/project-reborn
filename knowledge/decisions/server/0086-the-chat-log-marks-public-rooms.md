---
type: Decision
title: The Chat Log Viewer marks public rooms
description: The Room ID column shows a habbo room's id and Public before a public room's; a search for an id finds both kinds, and a deleted room's lines show -.
status: accepted
timestamp: 2026-11-10T20:10:23+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:10:23+00:00"}
tags: [housekeeping, chat]
---

# Decision

- The Room ID column of the Chat Log Viewer shows `101` for habbo room 101 and `Public 101` for the public room 101
  ([0063](/decisions/server/0063-public-rooms-and-habbo-rooms-apart.md)); a search for an id lists the lines of both.
- The lines of a deleted habbo room show `-`.

# Context

HoloCMS had one kind of room id. Offered the ids with public rooms marked, or the room's name and id, the user chose
"Ids, public ones marked (Recommended)": "'101' for habbo room 101 and 'Public 101' for the Welcome Lounge; a search for
101 lists both. A deleted room's lines show '-'. Example: the column reads 'Public 101' next to 'Hello lounge'."

# Consequences

- s4-08 applies it.
