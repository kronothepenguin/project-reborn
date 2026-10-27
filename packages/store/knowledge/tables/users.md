---
type: SQLite Table
title: users
description: The person behind one or more habbos, with email, birth date, newsletter opt-in and registration IP.
resource: packages/store/schema/users.schema.sql
tags: [store, table, identity]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | User id | primary key |
| `email` | TEXT `COLLATE NOCASE` | no | | Contact and password-reset address | unique, ignoring case |
| `born_on` | DATE | no | | Birth date | |
| `newsletter` | BOOLEAN | no | FALSE | Newsletter opt-in | |
| `created_ip` | TEXT | no | | IP the registration came from | |
| `created_at` | DATETIME | no | | Registration time (UTC) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |

# Keys

- Primary key `id`.
- `idx_users_email` UNIQUE (`email`).
- `idx_users_created_ip_created_at` (`created_ip`, `created_at`).

# Related

- Entity: [User](/entities/user.md).
- Referenced by [credentials](/tables/credentials.md), [sessions](/tables/sessions.md),
  [login_attempts](/tables/login_attempts.md), [password_resets](/tables/password_resets.md),
  [avatars](/tables/avatars.md), [access_group_members](/tables/access_group_members.md),
  [settings](/tables/settings.md), [referrals](/tables/referrals.md), [vouchers](/tables/vouchers.md),
  [bans](/tables/bans.md), [alerts](/tables/alerts.md), [help_tickets](/tables/help_tickets.md) and
  [staff_logs](/tables/staff_logs.md).
- Queries: [users.query.sql](/queries/users.md).
