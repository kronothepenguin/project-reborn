---
type: Decision
title: The wallet, the club and the home inventory belong to the user
description: One wallet and one club membership per user, and stickers, notes and backgrounds are shared while they are not placed on a home.
status: superseded
superseded_by: "0064"
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [economy, habbos]
---

# Decision

- A user has one wallet, used by all their habbos. The start credits are given once, so a habbo added later gets none
  and no setting is needed.
- Club belongs to the user, so all their habbos are members.
- Stickers, notes and backgrounds belong to the user while they are not placed on a home. A placed item belongs to that
  home until it is removed.
- A user can own up to `registration.maxHabbosPerUser` habbos, 5 by default.

# Context

Changes the line of [0014](/decisions/0014-attribute-based-access.md) that made club a property of the habbo. The user
answered: "what if we make the habbos share the same wallet instead, so we prevent a user for creating and deleting
habbos to get more credits", "go", "keep furni separated, share stickers and notes only if they are not in-use." and, on
club per user, "yes". Backgrounds follow stickers and notes because they share the inventory table.

# Consequences

- `wallets`, `club_subscriptions` and `home_inventory` move to the user, and `wallet_transactions` keeps which habbo
  acted.
- Existing databases must be recreated, as [0004](/decisions/0004-fresh-start.md) allows.
