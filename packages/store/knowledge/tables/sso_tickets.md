---
type: SQLite Table
title: sso_tickets
description: Login tickets the CMS makes for a session's active habbo and the game server spends once, kept as text and dying with the session.
resource: packages/store/schema/auth.schema.sql
tags: [store, table, auth]
timestamp: 2026-11-09T23:05:00+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | TEXT | no | | The ticket, as the client page shows it and the game client sends it | primary key |
| `session_id` | TEXT | no | | CMS session that made it | → `sessions.id` ON DELETE CASCADE |
| `avatar_id` | INTEGER | no | | Habbo the ticket logs in | → `avatars.id` ON DELETE CASCADE |
| `ip` | TEXT | no | | IP that asked for the ticket | |
| `created_at` | DATETIME | no | | When it was made (UTC) | |

# Keys

- Primary key `id`.
- `idx_sso_tickets_session_id` (`session_id`), `idx_sso_tickets_avatar_id` (`avatar_id`).

# Rules

- A ticket counts only while its session has not expired and still has the ticket's habbo active
  (`plans/server/decisions/0030-sso-tickets-from-the-cms-sign-in.md`).
- The game server spends a ticket once, by deleting it.

# Related

- Entity: [Session](/entities/session.md).
