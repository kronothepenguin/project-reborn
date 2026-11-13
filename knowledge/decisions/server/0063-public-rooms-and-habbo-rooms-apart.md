---
type: Decision
title: Public rooms and habbo rooms have tables of their own
description: public_rooms and rooms each keep only their own columns, so a habbo room's owner is NOT NULL, and a favourite names one or the other.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, store, rooms]
---

# Decision

- `public_rooms` and `rooms` each keep only their own columns: a public room its unit name, casts and category, a habbo
  room its creator and owner (`knowledge/decisions/holo-port/0057-furni-and-rooms.md`), door, password and settings, its
  owner NOT NULL.
- A favourite names one or the other: `favourite_rooms(avatar_id, public_room_id, room_id)`, exactly one of the two set.

# Context

Holo kept both in one `rooms` table, the public rooms without an owner. Offered two tables or one, the user chose "Two
tables (Recommended)": "public_rooms and rooms, each with only its own columns, so a habbo room's owner can be NOT NULL.
A favourite names one or the other: favourite_rooms(avatar_id, public_room_id, room_id), exactly one set."

# Consequences

- s3-01 creates them.
