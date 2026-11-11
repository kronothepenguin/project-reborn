---
type: SQLite Table
title: furni
description: A piece of furni: what it is, the user it belongs to, the habbo that holds it or the room it stands in with its place there, and its state.
resource: packages/store/schema/furni.schema.sql
tags: [store, table, furni]
timestamp: 2026-11-11T16:24:23+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Piece of furni; the client's id and strip id for it | primary key |
| `furni_definition_id` | INTEGER | no | | What it is | → `furni_definitions.id` |
| `user_id` | INTEGER | no | | The user it belongs to | → `users.id`, cascade |
| `avatar_id` | INTEGER | yes | | The habbo whose hand holds it; none when it is placed or shared | → `avatars.id`, set null |
| `room_id` | INTEGER | yes | | The room it stands in; none when it is in a hand or shared | → `rooms.id`, set null |
| `x` | INTEGER | no | 0 | A placed floor furni's tile | |
| `y` | INTEGER | no | 0 | A placed floor furni's tile | |
| `altitude` | REAL | no | 0 | How high a placed floor furni stands | |
| `direction` | INTEGER | no | 0 | Where a placed floor furni faces | CHECK 0 to 7 |
| `wall_position` | TEXT | no | `''` | A placed wall item's place, as the client writes it | |
| `state` | TEXT | no | `''` | The client's stuff data or item data: a dice's number, a gate open or shut, a present's note after `!`, a post-it's colour, the notes left on a pad of post-its | |
| `created_at` | DATETIME | no | | When the piece came to be | |
| `box_furni_id` | INTEGER | yes | | The present box it waits in; none once the box is opened | → `furni.id`, set null |
| `partner_furni_id` | INTEGER | yes | | The other teleport of a teleport's pair; none for other furni, or once the other is gone | → `furni.id`, set null |

# Keys

- Primary key `id`; `idx_furni_user_id` (`user_id`), `idx_furni_avatar_id` (`avatar_id`), `idx_furni_room_id`
  (`room_id`), `idx_furni_box_furni_id` (`box_furni_id`), `idx_furni_partner_furni_id` (`partner_furni_id`).
- CHECK: never both `avatar_id` and `room_id`.

# Notes

- A habbo that goes leaves its hand to the shared inventory, and a room that goes leaves its furni there too: both keys
  set null. The game server moves a deleted room's furni to its owner's hand first
  (`plans/server/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md`).
- The place of a furni that stands in no room means nothing.

# Related

- Entity: [Furni](/entities/furni.md).
- Queries: [furni.query.sql](/queries/furni.md).
