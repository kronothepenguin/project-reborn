---
type: SQLite Table
title: access_groups
description: Admin-defined named groups that grant attributes to their members.
resource: packages/store/schema/access.schema.sql
tags: [store, table, access]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Group id | primary key |
| `name` | TEXT `COLLATE NOCASE` | no | | Display name ("Administrators", "Moderators") | unique, ignoring case |
| `description` | TEXT | no | `''` | What the group is for | |
| `staff_listed` | BOOLEAN | no | FALSE | Whether `/staff` lists the group | |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |

# Keys

- Primary key `id`.
- `idx_access_groups_name` UNIQUE (`name`).

# Related

- Entity: [Access group](/entities/access-group.md).
- Referenced by [access_group_attributes](/tables/access_group_attributes.md) and
  [access_group_members](/tables/access_group_members.md).
