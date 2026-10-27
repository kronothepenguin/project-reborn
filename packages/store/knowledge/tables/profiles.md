---
type: SQLite Table
title: profiles
description: One web profile per habbo, the anchor of its home page and tags.
resource: packages/store/schema/profiles.schema.sql
tags: [store, table, profiles]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Profile id | primary key |
| `avatar_id` | INTEGER | no | | Habbo the profile belongs to | unique, → `avatars.id` ON DELETE CASCADE |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |

# Keys

- Primary key `id`.
- `idx_profiles_avatar_id` UNIQUE (`avatar_id`).

# Related

- Entity: [Profile](/entities/profile.md).
- Referenced by [profile_tags](/tables/profile_tags.md) and [homes](/tables/homes.md).
