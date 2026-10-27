---
type: Entity
title: Staff log
description: The audit trail of every staff action, with the acting user, the target user or habbo, and the IP.
tags: [store, entity, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Every housekeeping mutation writes one staff log row through a single helper, so the log is complete (Holo skipped
many actions).

# Invariants

- Rows are never updated or deleted by the application.
- Actor and targets become NULL when those accounts are deleted; the row stays.

# Lifecycle

- Written in the same transaction as the action it records; read in housekeeping with `housekeeping.logs`.

# Vocabularies

| Column | Values |
|--------|--------|
| `action` | dotted names of the form `<area>.<verb>` (`bans.create`, `credits.give`, `settings.update`); the list is defined with housekeeping |

# Relations

- Acting [user](/entities/user.md); target [user](/entities/user.md) or [habbo](/entities/habbo.md).

# Tables

- [staff_logs](/tables/staff_logs.md)
