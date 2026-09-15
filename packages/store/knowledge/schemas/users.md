---
type: SQL Schema File
title: users.schema.sql
description: Member identity shared by the CMS and the future game server.
resource: packages/store/schema/users.schema.sql
tags: [store, schema, users, accounts]
timestamp: 2026-09-12
---

# Table: users

One row per member account. The table is the member identity shared by the CMS
and, later, the game server; administrator status is assigned outside the CMS.

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | PK |
| `username` | TEXT | NOT NULL, display form |
| `username_canonical` | TEXT | NOT NULL, UNIQUE, lower-cased lookup |
| `password_hash` | TEXT | NOT NULL, never a clear password |
| `email` | TEXT | NOT NULL, display form |
| `email_canonical` | TEXT | NOT NULL, UNIQUE, lower-cased lookup |
| `birth_date` | INTEGER | NOT NULL, unix seconds at 00:00 UTC |
| `avatar` | TEXT | NOT NULL, `female` or `male` |
| `motto` | TEXT | NOT NULL DEFAULT `''` |
| `newsletter` | INTEGER | NOT NULL DEFAULT 0, 0/1 consent |
| `terms_accepted_at` | INTEGER | NOT NULL, unix seconds |
| `is_admin` | INTEGER | NOT NULL DEFAULT 0, assigned outside the CMS |
| `created_at` | INTEGER | NOT NULL, unix seconds |
| `last_signed_in_at` | INTEGER | NOT NULL DEFAULT 0, 0 = never |

`username_canonical` and `email_canonical` are the only uniqueness keys; the
display columns are never used for lookup. One user has many sessions and many
recovery tokens (the latter arrive with the recovery slice).

# Examples

Sign-in lookup uses the canonical form:

```sql
SELECT * FROM users WHERE username_canonical = 'newhabbo';
```

# Citations

1. [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
2. [SQLite UNIQUE constraints](https://www.sqlite.org/lang_createtable.html#unique_constraints)
