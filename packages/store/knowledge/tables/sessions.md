---
type: SQLite Table
title: sessions
description: Signed-in browsers of a user with their active habbo, keyed by the digest of the cookie token.
resource: packages/store/schema/auth.schema.sql
tags: [store, table, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | TEXT | no | | SHA-256 digest of the cookie token; the token is never stored | primary key |
| `user_id` | INTEGER | no | | Signed-in user | → `users.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | no | | Active habbo, one of the user's | → `avatars.id` ON DELETE CASCADE |
| `remember` | BOOLEAN | no | FALSE | Remember-me session (persistent cookie) | |
| `ip` | TEXT | no | | IP at sign-in | |
| `user_agent` | TEXT | no | | User agent at sign-in | |
| `created_at` | DATETIME | no | | Sign-in time (UTC) | |
| `last_seen_at` | DATETIME | no | | Last activity, written at most once a minute (UTC) | |
| `expires_at` | DATETIME | no | | Sliding expiry (UTC) | |

# Keys

- Primary key `id`.
- `idx_sessions_user_id` (`user_id`), `idx_sessions_avatar_id` (`avatar_id`), `idx_sessions_expires_at`
  (`expires_at`).

# Related

- Entity: [Session](/entities/session.md).
