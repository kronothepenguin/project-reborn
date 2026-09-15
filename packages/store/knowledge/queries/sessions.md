---
type: SQL Query
title: sessions.query.sql
description: Session persistence operations used by the auth adapter.
resource: packages/store/queries/sessions.query.sql
tags: [store, query, sessions, auth]
timestamp: 2026-09-12
---

# Operations

## CreateSession

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | digest, user id, timestamps, remember flag, revocation, user agent, address |
| Result | — |
| Tables touched | `sessions` |

Insert-only. A duplicate digest errors (unique PK) and is never upserted.

## GetSession

| Field | Value |
|-------|-------|
| Cardinality | `:one` |
| Inputs | digest |
| Result | `store.Session` |
| Tables touched | `sessions` |

Returns the row regardless of `revoked_at`; the auth library inspects the
record and emits the right denial. Absence is `sql.ErrNoRows`.

## TouchSession

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | `last_seen_at`, `idle_expires_at`, digest |
| Result | — |
| Tables touched | `sessions` |

Updates only activity columns; never any other field.

## RevokeSession

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | revocation time, digest |
| Result | — |
| Tables touched | `sessions` |

Sets `revoked_at` only where it is currently 0, so the operation is
idempotent.

## ListUserSessions

| Field | Value |
|-------|-------|
| Cardinality | `:many` |
| Inputs | user id |
| Result | `[]store.Session` |
| Tables touched | `sessions` |

Ordered by `created_at DESC`. The auth library filters revoked and past-deadline
records.

## PurgeSessions

| Field | Value |
|-------|-------|
| Cardinality | `:execrows` |
| Inputs | idle cutoff, absolute cutoff |
| Result | removed row count |
| Tables touched | `sessions` |

Deletes rows where `revoked_at != 0` or either deadline is at or before the
cutoff. Active sessions are never touched.

# Examples

```go
removed, err := s.PurgeSessions(ctx, store.PurgeSessionsParams{
    IdleExpiresAt:     now.Unix(),
    AbsoluteExpiresAt: now.Unix(),
})
```

# Citations

1. [sqlc query annotations](https://docs.sqlc.dev/en/latest/reference/query-annotations.html)
2. [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
