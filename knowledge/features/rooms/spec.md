---
type: Spec
title: Rooms
description: Loaded rooms, with their habbos and furni, stay in the game's memory, and a change made to a room or its furni outside the game reaches it at once.
status: planned
projects: [packages/server, packages/cms, packages/housekeeping, packages/services]
---

# What

Rooms are one feature wherever they change ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

The user: "something like rooms, i prefer a cache for loaded rooms (rooms with habbos), because placing/moving/picking
furnis, chats, and everything else will be a lot." And, of what needs a service: "something like furnis in a room or
rooms themselves."

It builds on [habbos](/features/habbos/spec.md).

# Behaviours

Written with the user when the feature is planned.

# Open questions

- What the feature holds: the room changes made on the site or in housekeeping that the game must show at once, and what
  [presence and rooms](/features/presence-and-rooms/spec.md) gives it.
