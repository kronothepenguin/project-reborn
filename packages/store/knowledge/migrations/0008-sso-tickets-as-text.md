---
type: SQL Update
title: 0008-sso-tickets-as-text.sql
description: Makes sso_tickets keep each ticket as text with the CMS session that made it, so the client page can show one and the game server can spend it.
resource: packages/store/migrations/0008-sso-tickets-as-text.sql
tags: [store, update, auth, game]
timestamp: 2026-11-09T23:05:00+00:00
---

# Update

| | |
|---|---|
| Title | SSO tickets kept as text with the CMS session that made them, so the client page can show one and the game server can spend it. |
| Automatic | no |

Makes [sso_tickets](/tables/sso_tickets.md) again: `id` holds the ticket as text instead of its digest, `session_id`
names the CMS session that made it, and `expires_at` goes, since a ticket lives as long as its session
(`plans/server/decisions/0030-sso-tickets-from-the-cms-sign-in.md`). No program made a ticket of the old form, so the
table is made again without copying its rows. Sign-in makes its ticket best-effort, so the update waits for an
administrator, as the others do (`plans/server/decisions/0043-the-sign-in-ticket-is-best-effort.md`).
