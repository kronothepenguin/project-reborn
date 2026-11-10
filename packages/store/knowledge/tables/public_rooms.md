---
type: SQLite Table
title: public_rooms
description: A public room of the hotel: its unit, the casts the client loads for it, its model, its category and its most visitors.
resource: packages/store/schema/navigator.schema.sql
tags: [store, table, navigator]
timestamp: 2026-11-10T03:49:03+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Public room; also the port the navigator gives it, as Holo did | primary key |
| `room_category_id` | INTEGER | no | | Category of public rooms | → `room_categories.id` |
| `room_model_id` | INTEGER | no | | Floor plan | → `room_models.id` |
| `name` | TEXT | no | | Name the navigator shows | |
| `unit` | TEXT | no | | Name the client knows the room by, such as `welcome_lounge` | |
| `casts` | TEXT | no | | The casts the client loads, comma-separated | |
| `max_visitors` | INTEGER | no | | Most visitors | CHECK > 0 |

# Keys

- Primary key `id`; `idx_public_rooms_room_category_id` (`room_category_id`).

# Related

- Entity: [Public room](/entities/public-room.md).
- Queries: [navigator.query.sql](/queries/navigator.md).
