---
type: SQLite Table
title: profile_tags
description: Tags a habbo put on its profile, used by tag search, the tag cloud and tag fight.
resource: packages/store/schema/profiles.schema.sql
tags: [store, table, profiles]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `profile_id` | INTEGER | no | | Tagged profile | primary key part, → `profiles.id` ON DELETE CASCADE |
| `tag` | TEXT | no | | Lowercase `[a-z0-9]`, 2–20 characters (validated in Go) | primary key part |
| `created_at` | DATETIME | no | | When the tag was added (UTC) | |

# Keys

- Primary key (`profile_id`, `tag`).
- `idx_profile_tags_tag` (`tag`).

# Related

- Entity: [Profile](/entities/profile.md).
