---
type: Phase
title: S3 Navigator
description: The navigator lists the public rooms and the habbos' rooms, searches and keeps favourites, and habbos create, edit and delete their rooms.
status: active
timestamp: 2026-11-10T03:41:09+00:00
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
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)), in `virtual/category`, `virtual/model` and
  `virtual/room` ([0060](/decisions/0060-virtual-category-model-and-room.md)); how many habbos are in each room lives
  only in memory ([0011](/decisions/0011-saved-and-memory-only-data.md)).
- A new hotel starts with Holo's categories, public rooms and room models
  ([0055](/decisions/0055-holos-navigator-set.md)), and public rooms and habbo rooms have tables of their own
  ([0063](/decisions/0063-public-rooms-and-habbo-rooms-apart.md)).
- Entering a room, its rights and its furni are [S4](/phases/s4-rooms.md)'s and [S5](/phases/s5-furni-catalogue.md)'s.

# Exit criteria

- The navigator's categories, public rooms and room models come from an update with Holo's data, and load when the
  server starts.
- A Go test client browses the navigator: the public categories with Holo's public rooms, and the categories of habbo
  rooms with their rooms, at most 30 a category; a category's parents and the categories its level may use; its own
  rooms; a search, at most 30 rooms; three recommended rooms; and its favourites, adding and removing one, with 33 past
  30.
- A habbo creates a room with the room-o-matic, up to 50, with a club model only with the club fuse and in a category
  its level allows; sets its description, its password, stored hashed, its furniture rights and its visitors; changes
  its name, door and category; and deletes it.
- S3's settings are in housekeeping.
- Every gate passes.

# Tasks

1. [s3-01 Add the navigator's tables and Holo's data](/tasks/s3-01-navigator-tables.md) **done**
2. [s3-02 Load the navigator's shared data in virtual](/tasks/s3-02-navigator-state.md) **done**
3. [s3-03 Browse the navigator's categories](/tasks/s3-03-browsing.md) **done**
4. [s3-04 List own rooms, search results and recommended rooms](/tasks/s3-04-room-lists.md)
5. [s3-05 Keep a habbo's favourite rooms](/tasks/s3-05-favourites.md)
6. [s3-06 Create a room with the room-o-matic](/tasks/s3-06-creating-a-room.md)
7. [s3-07 Read, change and delete a room](/tasks/s3-07-changing-a-room.md)
8. [s3-08 Check S3's exit criteria](/tasks/s3-08-exit-check.md)
