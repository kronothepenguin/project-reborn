---
type: SQL Schema File
title: store.schema.sql
description: Reserved comment-only placeholder for the store schema namespace.
resource: packages/store/schema/store.schema.sql
tags: [store, schema, reserved]
timestamp: 2026-09-12
---

# Schema

This file declares no structures. It is intentionally comment-only and exists
so that `//go:embed schema/*.schema.sql` and sqlc both have a non-empty schema
set while the store owns no domain tables. Features add their own additive
schema files next to it, following `packages/store/schema/<feature>.schema.sql`.

| Structure | Purpose |
|-----------|---------|
| (none)    | Reserved namespace only |

# Examples

Adding a feature schema file:

```sql
CREATE TABLE IF NOT EXISTS example_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
);
```

# Citations

1. [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
2. [Go embed](https://pkg.go.dev/embed)