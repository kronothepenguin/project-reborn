---
type: SQLite Table
title: password_resets
description: Single-use, expiring password-reset tokens, stored as digests of the emailed token.
resource: packages/store/schema/auth.schema.sql
tags: [store, table, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | TEXT | no | | SHA-256 digest of the emailed token | primary key |
| `user_id` | INTEGER | no | | User whose password the token resets | → `users.id` ON DELETE CASCADE |
| `created_at` | DATETIME | no | | Request time (UTC) | |
| `expires_at` | DATETIME | no | | Expiry, `auth.resetTokenMinutes` after creation (UTC) | |

# Keys

- Primary key `id`.
- `idx_password_resets_user_id` (`user_id`).

# Related

- Entity: [Credential](/entities/credential.md).
