---
type: SQLite Table
title: rooms
description: A habbo's room: its creator and owner, category, model, name, description, door, hashed password and settings.
resource: packages/store/schema/navigator.schema.sql
tags: [store, table, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Room | primary key |
| `creator_avatar_id` | INTEGER | no | | Habbo that created it, never changed | → `avatars.id` ON DELETE CASCADE |
| `owner_avatar_id` | INTEGER | no | | Habbo that owns it | → `avatars.id` ON DELETE CASCADE |
| `room_category_id` | INTEGER | no | | Category of habbo rooms | → `room_categories.id` |
| `room_model_id` | INTEGER | no | | Floor plan | → `room_models.id` |
| `name` | TEXT | no | | 1 to 50 characters (validated in Go) | |
| `description` | TEXT | no | `''` | Up to 125 characters (validated in Go) | |
| `door` | TEXT | no | `open` | `open`, `closed` (the bell) or `password` | CHECK closed set |
| `password_hash` | TEXT | yes | | Hash of the password | |
| `show_owner` | BOOLEAN | no | TRUE | The navigator names the owner | |
| `others_move_furni` | BOOLEAN | no | FALSE | Every visitor may move furniture | |
| `max_visitors` | INTEGER | no | 25 | Most visitors, 10 to 25 (validated in Go) | CHECK > 0 |
| `created_at`, `updated_at` | DATETIME | no | | Creation and last change (UTC) | |
| `wallpaper`, `floor`, `landscape` | TEXT | no | `''` | The patterns the room was decorated with, as the client names them; empty for the model's own | |

# Keys

- Primary key `id`; `idx_rooms_owner_avatar_id` (`owner_avatar_id`); `idx_rooms_room_category_id` (`room_category_id`).

# Related

- Entity: [Room](/entities/room.md).
- Queries: [navigator.query.sql](/queries/navigator.md).
