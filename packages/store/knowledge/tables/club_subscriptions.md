---
type: SQLite Table
title: club_subscriptions
description: Paid Habbo Club periods of a habbo; the habbo is a member while a period covers the current time.
resource: packages/store/schema/club.schema.sql
tags: [store, table, club]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Period id | primary key |
| `avatar_id` | INTEGER | no | | Member habbo | → `avatars.id` ON DELETE CASCADE |
| `starts_at` | DATETIME | no | | Period start (UTC) | |
| `ends_at` | DATETIME | no | | Period end (UTC) | CHECK > `starts_at` |
| `created_at` | DATETIME | no | | Purchase time (UTC) | |

# Keys

- Primary key `id`.
- `idx_club_subscriptions_avatar_id_ends_at` (`avatar_id`, `ends_at`).

# Related

- Entity: [Club subscription](/entities/club-subscription.md).
