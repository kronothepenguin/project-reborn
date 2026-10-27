---
type: Entity
title: Alert
description: A staff message shown in a habbo's Me feed until the habbo dismisses it.
tags: [store, entity, moderation]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Staff send alerts to one habbo, or to every habbo with `housekeeping.alertsBroadcast`. The Me page shows undismissed
alerts.

# Invariants

- An alert is shown while `dismissed_at` is NULL.

# Lifecycle

- Sent from housekeeping; a broadcast inserts one row per habbo.
- Dismissed by the recipient; deleted with the recipient habbo.

# Vocabularies

None.

# Relations

- Sent by a staff [user](/entities/user.md) to a [habbo](/entities/habbo.md).

# Tables

- [alerts](/tables/alerts.md)
