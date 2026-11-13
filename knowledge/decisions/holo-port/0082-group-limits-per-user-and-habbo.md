---
type: Decision
title: Owned groups count per user, memberships per habbo
description: A user owns at most three groups across all their habbos, paid from the shared purse, and each habbo holds at most ten memberships, requests included.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [groups, p5]
---

# Decision

- A user owns at most 3 groups across all their habbos, bought from the shared purse
  ([0056](/decisions/holo-port/0056-wallet-club-and-inventory-per-user.md)).
- Each habbo holds at most 10 memberships, waiting requests included, as Holo counted them.
- The numbers are the plan's `groups.*` settings, with Holo's values as defaults.

# Context

Holo allowed 3 owned groups and 10 memberships to an account that had one habbo. Asked whether the limits count per
habbo or per user, the user chose owned groups per user and memberships per habbo.
