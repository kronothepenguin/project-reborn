---
type: Phase
title: S3 Navigator
description: The navigator lists the public rooms and the habbos' rooms, searches and keeps favourites, and habbos create, edit and delete their rooms.
status: planned
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s3, server]
---

# Goal

The navigator lists the public rooms and the habbos' rooms by category, searches, shows favourites and recommended
rooms, and lets a habbo create, edit and delete their rooms.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_navigator` | [s1-04](/tasks/s1-04-navigator.md) | Categories, nodes and their users, room lists, search, favourites, recommended rooms, room info and settings, deleting a room |
| `hh_kiosk_room` | [s1-05](/tasks/s1-05-kiosk-room.md) | Creating a room |

- Rooms have a creator and an owner (`plans/holo-port/decisions/0057-furni-and-rooms.md`).
- The navigator categories and the public rooms are shared data, loaded at start
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)); how many habbos are in each room lives only in memory
  ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- Which categories and public rooms exist, and where the public rooms' models come from.
- How many rooms a habbo can own, the rules for room names, and the door modes and passwords.
- How recommended rooms are chosen.
- Whether favourites are saved, and how many a habbo keeps.
- What happens to a deleted room's furni.
