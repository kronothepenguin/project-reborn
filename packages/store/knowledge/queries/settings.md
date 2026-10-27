---
type: SQL Query
title: settings.query.sql
description: Settings operations to list, upsert and delete the stored runtime settings.
resource: packages/store/queries/settings.query.sql
tags: [store, query, settings]
timestamp: 2026-10-27T23:04:08+00:00
---

# Operations

## ListSettings

- Cardinality: `:many`
- Inputs: none
- Result: every row, sorted by key
- Tables: `settings`

## UpsertSetting

- Cardinality: `:exec`
- Inputs: `key`, `value` (JSON literal), `updated_at`, `updated_by_user_id` (nullable)
- Result: inserts or replaces the setting's value
- Tables: `settings`

## DeleteSetting

- Cardinality: `:exec`
- Inputs: `key`
- Result: removes the row, so the declared default applies again
- Tables: `settings`

# Related

- Entity: [Setting](/entities/setting.md).
