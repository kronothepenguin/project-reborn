---
type: SQLite Table
title: referrals
description: The habbo that referred each new user, and when the referral reward was paid.
resource: packages/store/schema/referrals.schema.sql
tags: [store, table, referrals]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `referred_user_id` | INTEGER | no | | User who registered through the link | primary key, → `users.id` ON DELETE CASCADE |
| `referrer_avatar_id` | INTEGER | yes | | Habbo named in `?refer=` | → `avatars.id` ON DELETE SET NULL |
| `created_at` | DATETIME | no | | Registration time (UTC) | |
| `rewarded_at` | DATETIME | yes | | When `referral.reward` credits were paid; NULL when not paid | |

# Keys

- Primary key `referred_user_id`.
- `idx_referrals_referrer_avatar_id` (`referrer_avatar_id`).

# Related

- Entity: [Referral](/entities/referral.md).
