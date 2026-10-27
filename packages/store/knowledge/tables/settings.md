---
type: SQLite Table
title: settings
description: Runtime settings, one JSON literal per declared setting key path.
resource: packages/store/schema/settings.schema.sql
tags: [store, table, settings]
timestamp: 2026-10-27T23:04:08+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `key` | TEXT | no | | Declared setting key path (`site.name`, `cms.refresh`) | primary key |
| `value` | TEXT | no | | JSON literal of the setting's type (`"Habbo"`, `true`, `20`) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |
| `updated_by_user_id` | INTEGER | yes | | User who made the change | → `users.id` ON DELETE SET NULL |

# Keys

- Primary key `key`.

# Related

- Entity: [Setting](/entities/setting.md).
- Queries: [settings.query.sql](/queries/settings.md).
