---
type: SQLite Table
title: avatar_game_data
description: What the game server saves of a habbo, its last time online, the machine id of its last game login and its sound setting; a habbo that never logged in to the game has no row.
resource: packages/store/schema/avatars.schema.sql
tags: [store, table, habbo, game]
timestamp: 2026-11-09T23:20:00+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Habbo | primary key, → `avatars.id` ON DELETE CASCADE |
| `last_online_at` | DATETIME | yes | | Last time online in the game, written at login and at logout (UTC) | |
| `machine_id` | TEXT | yes | | Machine id the game client sent at its last login | |
| `sound_enabled` | BOOLEAN | no | `TRUE` | Whether the game client plays sounds | |

# Keys

- Primary key `avatar_id`.

# Notes

- A table of its own, not columns of [avatars](/tables/avatars.md), which many queries read whole: while the update
  that adds it waits, nothing that reads `avatars` fails (`knowledge/decisions/server/0044-game-login-data-has-its-own-table.md`).
- The game server writes each value with an upsert, so the first write makes the row.

# Related

- Entity: [Habbo](/entities/habbo.md).
- Queries: [avatars.query.sql](/queries/avatars.md).
