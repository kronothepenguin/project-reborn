---
type: Entity
title: Furni
description: A piece of furni that a user owns: in a habbo's hand, placed in a room, or in the user's shared inventory.
tags: [store, entity, furni]
timestamp: 2026-11-11T16:24:23+00:00
---

# Definition

A piece of furni is one thing a habbo bought, was given or took: a chair, a poster. What it is comes from its
[definition](/entities/furni-definition.md). It belongs to a user, and it is in one of three places
(`plans/holo-port/decisions/0057-furni-and-rooms.md`):

| Place | `avatar_id` | `room_id` |
|-------|-------------|-----------|
| A habbo's hand | the habbo | none |
| A room | none | the room |
| A present, the box that holds it | none | none |
| The user's shared inventory | none | none |

# Invariants

- It is never in a hand and in a room at once.
- A furni that waits in a present names its box, `box_furni_id`, and is in no hand and no room until the box is
  opened; one with no habbo, no room and no box is in the shared inventory.
- The hand lives only here: the game server keeps no copy, and reads it each time
  (`plans/server/decisions/0096-the-hand-is-read-from-the-database.md`).
- A hand lists its furni the oldest first, by id.

# Lifecycle

- Created in a hand, or with no habbo in the shared inventory.
- Placing takes it from a hand into a room, and picking up from a room into the hand of the habbo that picks it up,
  whose user it then belongs to, whoever placed it (`plans/server/decisions/0103-whoever-picks-a-furni-up-keeps-it.md`).
  A deleted room's furni goes to its owner's hand the same way.
- A pad of post-its is never placed: each of its notes becomes a furni of its own on a wall, and the pad, which
  counts its notes in its state, goes with the last. A post-it is never picked up, only deleted, and its text is in
  [furni_notes](/tables/furni_notes.md).
- Trading and the site's Take move it between hands; the tasks of `plans/server/phases/s5-furni-catalogue.md` bring
  them.

# Relations

- Is of one [furni definition](/entities/furni-definition.md).
- Belongs to a [user](/entities/user.md); held by a [habbo](/entities/habbo.md) or standing in a
  [room](/entities/room.md).
- A teleport names the other teleport of its pair, which names it back. The two are bought together and stay a pair
  whoever holds either (`plans/server/decisions/0111-a-teleport-keeps-its-partner.md`).

# Tables

- [furni](/tables/furni.md)
- [furni_notes](/tables/furni_notes.md)

# Queries

- [furni.query.sql](/queries/furni.md)
