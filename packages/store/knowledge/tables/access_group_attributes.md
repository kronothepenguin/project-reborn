---
type: SQLite Table
title: access_group_attributes
description: The attributes each access group grants, one row per group and attribute.
resource: packages/store/schema/access.schema.sql
tags: [store, table, access]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `access_group_id` | INTEGER | no | | Granting group | primary key part, → `access_groups.id` ON DELETE CASCADE |
| `attribute` | TEXT | no | | Attribute name from the catalogue (`housekeeping.news`, `forum.edit`) | primary key part |

# Keys

- Primary key (`access_group_id`, `attribute`).

# Related

- Entity: [Access group](/entities/access-group.md) (the attribute catalogue is listed there).
