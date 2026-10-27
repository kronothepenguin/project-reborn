---
type: SQL Schema File
title: moderation.schema.sql
description: Declares bans, staff alerts, help tickets and the staff log.
resource: packages/store/schema/moderation.schema.sql
tags: [store, schema, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Schema

| Structure | Kind | Purpose |
|-----------|------|---------|
| [bans](/tables/bans.md) | table | Bans of a user, an IP or both, with expiry and lifting |
| `idx_bans_user_id`, `idx_bans_ip` | indexes | Active bans at login |
| [alerts](/tables/alerts.md) | table | Staff messages shown in a habbo's feed |
| `idx_alerts_avatar_id_dismissed_at` | index | Undismissed alerts of a habbo |
| [help_tickets](/tables/help_tickets.md) | table | Help requests and forum post reports |
| `idx_help_tickets_closed_at` | index | Open tickets |
| [staff_logs](/tables/staff_logs.md) | table | One row per staff action |
| `idx_staff_logs_created_at`, `idx_staff_logs_target_user_id`, `idx_staff_logs_target_avatar_id` | indexes | Log pages and history of a target |

Entities: [Ban](/entities/ban.md), [Alert](/entities/alert.md), [Help ticket](/entities/help-ticket.md),
[Staff log](/entities/staff-log.md).
