---
type: Decision
title: Up to 50 spectators watch a full room, from its queue
description: A habbo waiting for a full room can switch to the spectators' line; up to game.maxSpectators, 50, watch at once, and a spectator leaving lets the next one in.
status: accepted
timestamp: 2026-11-10T20:58:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:58:46+00:00"}
tags: [server, rooms, spectators]
---

# Decision

- A habbo waiting for a full room can switch to the spectators' line, the queue window's second choice
  (`ROOM_QUEUE_CHANGE`), and back.
- Up to `game.maxSpectators`, 50 by default, watch a room at once; a spectator leaving lets the next one in.
- A spectator sees the room through the client's TV frame, with the chat, but has no avatar and cannot act.

# Context

Offered up to 50 spectators from the queue, or no spectators, the user chose "Up to 50, from the queue
(Recommended)": "A habbo waiting for a full room can switch to the spectators' line (the queue window's second choice,
ROOM_QUEUE_CHANGE); up to game.maxSpectators (50, a setting) watch at once, and a spectator leaving lets the next one
in. Example: while waiting for the Welcome Lounge, a habbo switches to watch it and sees the room on the TV." Every full
room queues ([0087](/decisions/0087-every-full-room-queues.md)), so every full room takes spectators.

# Consequences

- [s4-12](/tasks/s4-12-queue-and-spectators.md) applies it, with the setting `game.maxSpectators`.
