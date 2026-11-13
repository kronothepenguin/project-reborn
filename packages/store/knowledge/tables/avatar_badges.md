---
type: SQLite Table
title: avatar_badges
description: Badges owned by a habbo, each worn in a slot 1 to 5 or not worn.
resource: packages/store/schema/avatars.schema.sql
tags: [store, table, habbo]
timestamp: 2026-11-10T20:23:05+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `avatar_id` | INTEGER | no | | Owning habbo | primary key part, → `avatars.id` ON DELETE CASCADE |
| `code` | TEXT | no | | Badge code known to the client (for example `HC1`) | primary key part |
| `slot` | INTEGER | no | 0 | Where the habbo wears the badge, 1 to 5 as the R26 client's badge window sets them, or 0 | CHECK 0 to 5 |
| `granted_at` | DATETIME | no | | Grant time (UTC) | |

# Keys

- Primary key (`avatar_id`, `code`).
- `idx_avatar_badges_avatar_id_slot` UNIQUE (`avatar_id`, `slot`) WHERE `slot > 0`: one badge at most in each slot
  (`knowledge/decisions/server/0083-a-habbo-wears-five-badges-in-slots.md`).

# Related

- Entity: [Habbo](/entities/habbo.md).
- Queries: [avatars.query.sql](/queries/avatars.md).
