---
type: Entity
title: Help ticket
description: A help request from a habbo or a report of a forum post, handled by staff in housekeeping.
tags: [store, entity, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Help tickets come from the help tool or from reporting a forum post (`forum_post_id` set). Staff pick them up and
close them.

# Invariants

- A ticket is open while `closed_at` is NULL.
- A habbo has at most one open help-tool ticket (validated in Go); post reports are not limited.

# Lifecycle

- Created on the site; picked up and closed from housekeeping with `housekeeping.help`.
- Kept when the reporter or the reported post is deleted.

# Vocabularies

None.

# Relations

- Reported by a [habbo](/entities/habbo.md); may point at a [forum post](/entities/forum-thread.md); handled by a
  staff [user](/entities/user.md).

# Tables

- [help_tickets](/tables/help_tickets.md)
