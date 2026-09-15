---
type: SQL Schema File
title: login-attempts.schema.sql
description: Failed sign-in counters behind per-key throttling.
resource: packages/store/schema/login-attempts.schema.sql
tags: [store, schema, throttling, auth]
timestamp: 2026-09-12
---

# Table: login_attempts

One row per throttling key. Keys are namespaced strings: `u:<canonical-username>`
for account sign-in, `ip:<remote-address>` for the source address, and
`r:<canonical-username>` for recovery requests (recovery arrives with its slice).

| Column | Type | Rules |
|---|---|---|
| `key` | TEXT | PK, namespaced key |
| `failures` | INTEGER | NOT NULL DEFAULT 0, consecutive failures in the window |
| `locked_until` | INTEGER | NOT NULL DEFAULT 0, 0 = not locked |
| `updated_at` | INTEGER | NOT NULL, unix seconds of the last failure |

State transitions: absent → accumulating (window 15 min, max 5) → locked
(15 min). A failure older than the window restarts the count at 1. A successful
sign-in deletes the account key; the address key expires through its own
window/lock.

# Examples

Removing a key after a successful sign-in:

```sql
DELETE FROM login_attempts WHERE key = 'u:newhabbo';
```

# Citations

1. [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
2. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
