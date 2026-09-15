---
type: SQL Query
title: login-attempts.query.sql
description: Window-aware failure counters and lock operations for throttling.
resource: packages/store/queries/login-attempts.query.sql
tags: [store, query, throttling, auth]
timestamp: 2026-09-12
---

# Operations

## UpsertLoginFailure

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | attempt key, window start, now |
| Result | — |
| Tables touched | `login_attempts` |

Window-aware increment. When the stored `updated_at` is older than
`window_start`, the counter restarts at 1 (and a stale lock is cleared);
otherwise `failures` increments and any lock is preserved. The statement is a
single `INSERT OR REPLACE ... SELECT` so concurrent attempts stay correct on the
store's single connection.

## GetLoginAttempt

| Field | Value |
|-------|-------|
| Cardinality | `:one` |
| Inputs | attempt key |
| Result | `store.LoginAttempt` |
| Tables touched | `login_attempts` |

Reads the current failure count and lock. Absence is `sql.ErrNoRows` and means
"no failures recorded".

## LockLoginAttempt

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | lock expiry, attempt key |
| Result | — |
| Tables touched | `login_attempts` |

Sets `locked_until` after the configured threshold is reached.

## ClearLoginAttempt

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | attempt key |
| Result | — |
| Tables touched | `login_attempts` |

Removes a key after a successful sign-in.

# Examples

```go
err := s.UpsertLoginFailure(ctx, store.UpsertLoginFailureParams{
    AttemptKey:  "u:newhabbo",
    WindowStart: now.Add(-window).Unix(),
    Now:         now.Unix(),
})
```

# Citations

1. [SQLite INSERT OR REPLACE](https://www.sqlite.org/lang_insert.html)
2. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
