---
type: SQL Query
title: users.query.sql
description: User account operations for lookup, creation, and sign-in tracking.
resource: packages/store/queries/users.query.sql
tags: [store, query, users, accounts]
timestamp: 2026-09-12
---

# Operations

## CreateUser

| Field | Value |
|-------|-------|
| Cardinality | `:execlastid` |
| Inputs | display and canonical username/email, password hash, birth date, avatar, newsletter, terms acceptance, creation time |
| Result | new `users.id` |
| Tables touched | `users` |

Registration insert. A unique-constraint conflict on `username_canonical` or
`email_canonical` is reported to the caller, which maps it to the corresponding
field error even when a pre-check passed.

## GetUserByID

| Field | Value |
|-------|-------|
| Cardinality | `:one` |
| Inputs | `id` |
| Result | `store.User` |
| Tables touched | `users` |

Personal page and session identity lookup. Absence is `sql.ErrNoRows`; classify
with `IsNotFound`.

## GetUserByUsername

| Field | Value |
|-------|-------|
| Cardinality | `:one` |
| Inputs | canonical username |
| Result | `store.User` |
| Tables touched | `users` |

The only lookup by natural key; callers always pass a lower-cased value.
Availability checks and sign-in use it.

## MarkUserSignedIn

| Field | Value |
|-------|-------|
| Cardinality | `:exec` |
| Inputs | sign-in time, `id` |
| Result | — |
| Tables touched | `users` |

Updates `last_signed_in_at` after a successful sign-in.

# Examples

```go
user, err := s.GetUserByUsername(ctx, "newhabbo")
if store.IsNotFound(err) {
    // unknown username
}
```

# Citations

1. [sqlc query annotations](https://docs.sqlc.dev/en/latest/reference/query-annotations.html)
2. [SQLite INSERT](https://www.sqlite.org/lang_insert.html)
