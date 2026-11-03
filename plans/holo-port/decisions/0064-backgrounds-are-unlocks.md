---
type: Decision
title: Home backgrounds are unlocks
description: A background is bought once and stays in the user's inventory, so any home of the user's habbos can show it, and the store refuses a second copy.
status: accepted
timestamp: 2026-11-03T17:26:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:05+00:00"}
tags: [homes, economy]
---

# Decision

- A background is bought once and stays in the user's inventory. Any number of homes of the user's habbos can show it at
  once, and showing it takes nothing from the inventory.
- The store refuses a second copy with Holo's `You already have a background of this type in your inventory!`.
- Stickers and notes stay as [0056](/decisions/0056-wallet-club-and-inventory-per-user.md) says: they belong to the user
  while they are not placed, and a placed item belongs to its home until it is removed.
- The rest of [0056](/decisions/0056-wallet-club-and-inventory-per-user.md) stands.

# Context

Supersedes [0056](/decisions/0056-wallet-club-and-inventory-per-user.md), whose line that backgrounds follow stickers and
notes was inferred from their shared inventory table, not said by the user. In Holo a bought background never leaves the
inventory. Asked how a background should work for a user with several habbos, the user chose "Unlock, as Holo".

# Consequences

- Archiving a habbo returns its placed stickers and notes, and its background needs nothing.
- A home shows only a background that its owner's inventory holds.
