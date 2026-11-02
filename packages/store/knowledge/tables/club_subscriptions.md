---
type: SQLite Table
title: club_subscriptions
description: Paid Habbo Club periods of a user; the user is a member while a period covers the current time.
resource: packages/store/schema/club.schema.sql
tags: [store, table, club]
timestamp: 2026-11-02T01:44:15+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Period id | primary key |
| `user_id` | INTEGER | no | | Member user | → `users.id` ON DELETE CASCADE |
| `starts_at` | DATETIME | no | | Period start (UTC) | |
| `ends_at` | DATETIME | no | | Period end (UTC) | CHECK > `starts_at` |
| `created_at` | DATETIME | no | | Purchase time (UTC) | |

# Keys

- Primary key `id`.
- `idx_club_subscriptions_user_id_ends_at` (`user_id`, `ends_at`).

# Related

- Entity: [Club subscription](/entities/club-subscription.md).
