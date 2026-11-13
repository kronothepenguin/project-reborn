---
type: Slice
title: Rooms
description: Loaded rooms, with their habbos and furni, stay in the game's memory, and a change made to a room or its furni outside the game reaches it at once.
status: planned
projects: [server, cms, housekeeping, services]
depends_on: [habbos]
from: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [rooms]
---

# Goal

Rooms are one feature wherever they change ([0010](/decisions/0010-slices-follow-the-hotels-features.md)).

The user: "something like rooms, i prefer a cache for loaded rooms (rooms with habbos), because placing/moving/picking
furnis, chats, and everything else will be a lot." And, of what needs a service: "something like furnis in a room or
rooms themselves."

# Scope

Written when the slice starts, with what [presence and rooms](/slices/presence-and-rooms.md) holds.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- What the slice holds: the room changes made on the site or in housekeeping that the game must show at once, and what
  [presence and rooms](/slices/presence-and-rooms.md) gives it.
