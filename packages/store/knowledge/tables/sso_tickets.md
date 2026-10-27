---
type: SQLite Table
title: sso_tickets
description: One-time login tickets handed to the game client for a habbo, stored as digests; their API waits for the game server.
resource: packages/store/schema/auth.schema.sql
tags: [store, table, auth]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | TEXT | no | | SHA-256 digest of the ticket | primary key |
| `avatar_id` | INTEGER | no | | Habbo the ticket signs in | → `avatars.id` ON DELETE CASCADE |
| `ip` | TEXT | no | | IP that requested the ticket | |
| `created_at` | DATETIME | no | | Issue time (UTC) | |
| `expires_at` | DATETIME | no | | Expiry (UTC) | |

# Keys

- Primary key `id`.
- `idx_sso_tickets_avatar_id` (`avatar_id`).

# Related

- Entity: [Session](/entities/session.md).
