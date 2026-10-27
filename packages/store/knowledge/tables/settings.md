---
type: SQLite Table
title: settings
description: Runtime overrides of config values, one JSON literal per config key path.
resource: packages/store/schema/settings.schema.sql
tags: [store, table, settings]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `key` | TEXT | no | | Config key path (`site.name`, `club.price1Month`) | primary key |
| `value` | TEXT | no | | JSON literal of the key's type (`"Habbo"`, `true`, `20`) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |
| `updated_by_user_id` | INTEGER | yes | | User who made the change | → `users.id` ON DELETE SET NULL |

# Keys

- Primary key `key`.

# Related

- Entity: [Setting](/entities/setting.md).
- Queries: [settings.query.sql](/queries/settings.md).
