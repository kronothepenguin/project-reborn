---
type: SQL Query
title: ping.query.sql
description: Connectivity smoke query returning 1.
resource: packages/store/queries/ping.query.sql
tags: [store, query, smoke]
timestamp: 2026-09-12
---

# Operations

## Ping

| Field | Value |
|-------|-------|
| Cardinality | `:one` |
| Inputs | none |
| Result | `int64` constant `1` |
| Tables touched | none |

`Ping` proves connectivity through the store: if it returns `1`, the database
file opened, the connection is live, and the generated operation is bound to
the store. It carries no domain meaning.

# Examples

```go
s, err := store.Open("habbo.db")
if err != nil {
    return err
}
defer s.Close()

if _, err := s.Ping(ctx); err != nil {
    return err
}
```

# Citations

1. [sqlc query annotations](https://docs.sqlc.dev/en/latest/reference/query-annotations.html)