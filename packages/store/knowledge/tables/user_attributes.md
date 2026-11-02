---
type: SQLite Table
title: user_attributes
description: Attributes given to a user directly, on top of those of their access groups.
resource: packages/store/schema/access.schema.sql
tags: [store, table, access]
timestamp: 2026-11-02T01:52:57+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `user_id` | INTEGER | no | | User holding the attribute | primary key part, → `users.id` ON DELETE CASCADE |
| `attribute` | TEXT | no | | A catalogue attribute | primary key part |
| `granted_at` | DATETIME | no | | Grant time (UTC) | |
| `granted_by_user_id` | INTEGER | yes | | Staff member who gave it | → `users.id` ON DELETE SET NULL |

# Keys

- Primary key (`user_id`, `attribute`).
- `idx_user_attributes_attribute` (`attribute`).

# Related

- Entity: [Access group](/entities/access-group.md) (the allowed `attribute` values are listed there).
- Queries: [access.query.sql](/queries/access.md).
