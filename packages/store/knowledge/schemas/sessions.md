---
type: SQL Schema File
title: sessions.schema.sql
description: Authenticated visits persisted by the session library contracts.
resource: packages/store/schema/sessions.schema.sql
tags: [store, schema, sessions, auth]
timestamp: 2026-09-12
---

# Table: sessions

One row per authenticated visit. The `packages/auth` library owns the session
lifecycle; the CMS persists records through its `authstore` adapter. The raw
credential is never stored: `id` is a SHA-256 digest.

| Column | Type | Rules |
|---|---|---|
| `id` | TEXT | PK, credential digest |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `created_at` | INTEGER | NOT NULL, unix seconds |
| `last_seen_at` | INTEGER | NOT NULL, unix seconds |
| `idle_expires_at` | INTEGER | NOT NULL, unix seconds |
| `absolute_expires_at` | INTEGER | NOT NULL, unix seconds |
| `remember` | INTEGER | NOT NULL, 0/1 |
| `revoked_at` | INTEGER | NOT NULL DEFAULT 0, 0 = active |
| `user_agent` | TEXT | NOT NULL DEFAULT `''` |
| `address` | TEXT | NOT NULL DEFAULT `''` |

Indexes: `idx_sessions_user_id` (account session lists and revocation) and
`idx_sessions_absolute_expires_at` (purge scans).

State transitions: created → active → (revoked | idle-expired |
absolute-expired) → purged. The library enforces deadlines; the adapter only
persists them.

# Examples

Active records for one account:

```sql
SELECT * FROM sessions WHERE user_id = 42 ORDER BY created_at DESC;
```

# Citations

1. [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html)
2. [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
