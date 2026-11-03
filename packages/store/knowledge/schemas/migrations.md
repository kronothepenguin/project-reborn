---
type: SQL Schema File
title: migrations.schema.sql
description: Declares the migrations table, the record of the update files applied to the database.
resource: packages/store/schema/migrations.schema.sql
tags: [store, schema, updates]
timestamp: 2026-11-03T21:45:00+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [migrations](/tables/migrations.md) | table | One row per update file applied to the database |

The update runner creates the table inside the transaction of the first update it applies, so reading a database never
writes to it.

Entity: [Update](/entities/update.md).
