---
type: Phase
title: S4 Rooms
description: Habbos enter rooms, see each other, walk, talk and act, and owners manage rights, the doorbell, kicks and bans.
status: planned
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s4, server]
---

# Goal

Habbos enter public and private rooms, see each other, walk, talk, dance and wave. Owners give rights, answer the
doorbell, kick and ban, and habbos rate rooms, ignore others and hold room events.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_room` | [s1-06](/tasks/s1-06-room.md) | Entering and leaving, the heightmap, habbos and their status, walking, chat, dance and wave, rights, the doorbell, kicks and bans, rating, ignoring, typing, room events, spectators and the queue, group badges, tags |
| `hh_room_utils` | [s1-07](/tasks/s1-07-room-utils.md) | Dialogs, one-way doors, the chat manager |

- Saved: room rights, bans, chat history, rating and ignore lists. Only in memory: positions, loaded rooms and room
  events ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- How walking works: the tick, diagonal steps and heights.
- Who may read the chat history, and for how long it is kept.
- How long a room ban lasts.
- Whether the doorbell, the room queue and the spectators live only in memory.
- Which group badge a habbo shows in a room, from the site's groups.
- Whether room ads and interstitials are shown.
- When an empty room unloads: at once or after a while.
