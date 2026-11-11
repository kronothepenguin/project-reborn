---
type: SQL Schema File
title: furni.schema.sql
description: Declares furni, the pieces of furni habbos own, each in a hand, in a room or in its user's shared inventory, and furni_notes, what is written on a post-it.
resource: packages/store/schema/furni.schema.sql
tags: [store, schema, furni]
timestamp: 2026-11-11T16:24:23+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [furni](/tables/furni.md) | table | The pieces of furni habbos own |
| `idx_furni_user_id` | index | A user's furni |
| `idx_furni_avatar_id` | index | A habbo's hand |
| `idx_furni_room_id` | index | A room's furni |
| `idx_furni_box_furni_id` | index | What waits in a present |
| [furni_notes](/tables/furni_notes.md) | table | What is written on a post-it |

Entity: [Furni](/entities/furni.md).
