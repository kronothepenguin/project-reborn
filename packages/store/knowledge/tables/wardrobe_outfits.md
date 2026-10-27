---
type: SQLite Table
title: wardrobe_outfits
description: Outfits a habbo saved in numbered wardrobe slots.
resource: packages/store/schema/avatars.schema.sql
tags: [store, table, habbo]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Owning habbo | primary key part, → `avatars.id` ON DELETE CASCADE |
| `slot` | INTEGER | no | | Slot number, from 1 up to `homes.wardrobeSlots` | primary key part, CHECK ≥ 1 |
| `figure` | TEXT | no | | Saved look in dot format | |
| `gender` | TEXT | no | | `'M'` or `'F'` | CHECK |
| `updated_at` | DATETIME | no | | Last save (UTC) | |

# Keys

- Primary key (`avatar_id`, `slot`).

# Related

- Entity: [Habbo](/entities/habbo.md).
