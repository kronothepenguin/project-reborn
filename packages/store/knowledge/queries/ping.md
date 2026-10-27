---
type: SQL Query
title: ping.query.sql
description: Connectivity smoke query returning 1.
resource: packages/store/queries/ping.query.sql
tags: [store, query, smoke]
timestamp: 2026-10-27T21:01:41+00:00
---

# Operations

## Ping

| Field | Value |
|-------|-------|
| Cardinality | `:one` |
| Inputs | none |
| Result | `int64` constant `1` |
| Tables touched | none |

`Ping` proves connectivity: if it returns `1`, the database file opened, the
connection is live, and the generated operation is bound to it. It carries no
domain meaning.

# Examples

```go
db, err := store.Open("habbo.db")
if err != nil {
    return err
}
defer db.Close()

if _, err := store.New(db).Ping(ctx); err != nil {
    return err
}
```

# Citations

1. [sqlc query annotations](https://docs.sqlc.dev/en/latest/reference/query-annotations.html)
