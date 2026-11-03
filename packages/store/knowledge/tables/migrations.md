---
type: SQLite Table
title: migrations
description: One row per update file applied to the database, with its version, name and time.
resource: packages/store/schema/migrations.schema.sql
tags: [store, table, updates]
timestamp: 2026-11-03T21:45:00+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `version` | INTEGER | no | | The update's number, from its file name (`0002` is 2) | primary key |
| `name` | TEXT | no | | The rest of the file name (`home-store`) | |
| `applied_at` | DATETIME | no | | When the update was applied (UTC) | |

# Keys

- Primary key `version`.

# Related

- Entity: [Update](/entities/update.md).
- Queries: [migrations.query.sql](/queries/migrations.md).
