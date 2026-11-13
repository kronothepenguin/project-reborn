---
type: Decision
title: Rooms have 11 event types, as Holo
description: Room events have the types 1 to game.roomEventTypes, 11, which the client names from its texts; only a room's owner hosts an event there, one at a time, until it leaves the room or logs out.
status: accepted
timestamp: 2026-11-10T19:40:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
tags: [server, rooms, events]
---

# Decision

- Room events have the types 1 to `game.roomEventTypes`, 11 by default, as Holo's `events_categorycount`; the client
  names each from its texts `roomevent_type_<n>`.
- Only a room's owner hosts an event there, one at a time. An event lives in memory
  ([0011](/decisions/0011-saved-and-memory-only-data.md)) and ends when its host leaves the room or logs out.

# Context

Offered 11 types as a setting or fixed, the user chose "11, as Holo (Recommended)": "Types 1 to 11 (a setting,
game.roomEventTypes); the client names each from its texts. Example: an owner picks 'Parties' (type 2, say) and the
navigator's event list for that type shows the room." The question said: "Only a room's owner hosts an event there, one
at a time; the event lives in memory (decision 0011) and ends when its host leaves the room or logs out."

# Consequences

- [s4-07](/tasks/s4-07-room-extras.md) applies it, with the setting `game.roomEventTypes`.
