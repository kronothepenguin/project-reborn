---
type: SQL Query
title: settings.query.sql
description: Settings operations to list, upsert and delete the runtime overrides of config values.
resource: packages/store/queries/settings.query.sql
tags: [store, query, settings]
timestamp: 2026-10-27T21:44:59+00:00
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
- Result: inserts or replaces the override
- Tables: `settings`

## DeleteSetting

- Cardinality: `:exec`
- Inputs: `key`
- Result: removes the override, so the config value applies again
- Tables: `settings`

# Related

- Entity: [Setting](/entities/setting.md).
