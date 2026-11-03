---
type: SQL Query
title: migrations.query.sql
description: Update operations to list the applied updates, find one, and record one in the transaction that applies it.
resource: packages/store/queries/migrations.query.sql
tags: [store, query, updates]
timestamp: 2026-11-03T21:45:00+00:00
---

# Operations

## ListMigrations

- Cardinality: `:many`
- Inputs: none
- Result: every applied update, sorted by version
- Tables: `migrations`

## GetMigration

- Cardinality: `:one`
- Inputs: `version`
- Result: the row of that update, or `sql.ErrNoRows` when it is not applied
- Tables: `migrations`

## CreateMigration

- Cardinality: `:exec`
- Inputs: `version`, `name`, `applied_at`
- Result: records an update, inside the transaction that applies it
- Tables: `migrations`

# Related

- Entity: [Update](/entities/update.md).
