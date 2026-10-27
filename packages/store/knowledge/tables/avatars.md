---
type: SQLite Table
title: avatars
description: Habbos, the in-hotel identities owned by a user, with name, figure, gender and motto.
resource: packages/store/schema/avatars.schema.sql
tags: [store, table, habbo]
timestamp: 2026-10-27T21:17:19+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | rowid | Habbo id | primary key |
| `user_id` | INTEGER | no | | Owning user | → `users.id` ON DELETE CASCADE |
| `name` | TEXT `COLLATE NOCASE` | no | | Habbo name, also the login name | unique, ignoring case |
| `figure` | TEXT | no | | Look in dot format (`hd-180-1.ch-215-82.lg-270-82`) | |
| `gender` | TEXT | no | | `'M'` or `'F'` | CHECK |
| `motto` | TEXT | no | `''` | Motto, stored raw | |
| `created_at` | DATETIME | no | | Creation time (UTC) | |
| `updated_at` | DATETIME | no | | Last change (UTC) | |

# Keys

- Primary key `id`.
- `idx_avatars_name` UNIQUE (`name`).
- `idx_avatars_user_id` (`user_id`).

# Related

- Entity: [Habbo](/entities/habbo.md).
- Referenced by [sessions](/tables/sessions.md), [login_attempts](/tables/login_attempts.md),
  [sso_tickets](/tables/sso_tickets.md), [avatar_badges](/tables/avatar_badges.md),
  [wardrobe_outfits](/tables/wardrobe_outfits.md), [access_group_members](/tables/access_group_members.md),
  [referrals](/tables/referrals.md), [profiles](/tables/profiles.md), [home_items](/tables/home_items.md),
  [home_inventory](/tables/home_inventory.md), [groups](/tables/groups.md),
  [group_members](/tables/group_members.md), [wallets](/tables/wallets.md),
  [wallet_transactions](/tables/wallet_transactions.md), [vouchers](/tables/vouchers.md),
  [club_subscriptions](/tables/club_subscriptions.md), [forum_threads](/tables/forum_threads.md),
  [forum_posts](/tables/forum_posts.md), [news_articles](/tables/news_articles.md), [alerts](/tables/alerts.md),
  [help_tickets](/tables/help_tickets.md) and [staff_logs](/tables/staff_logs.md).
