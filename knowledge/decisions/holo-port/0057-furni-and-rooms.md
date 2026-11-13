---
type: Decision
title: Furni and rooms
description: Furni is split per habbo with a shared inventory per user, and rooms have a creator and an owner, so a user can move a room between their habbos with its furni in place.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [game-server, habbos]
---

# Decision

For the game server:

- Every furni item belongs to a user. A habbo holding it has it in their hand, nobody holding it makes it shared, and a
  placed item is in a room.
- Furni bought in the catalogue goes to the habbo who bought it. A club gift goes to the shared inventory.
- Shared furni moves one way, to a habbo. The R26 client shows one hand, so the shared inventory is a page on the site
  with a Take button for the active habbo.
- A room has a creator, which never changes, and an owner. A user can move a room to another of their habbos, with its
  furni in place.
- When a habbo is archived, its hand furni moves to the shared inventory and its rooms move to the active habbo, with
  their furni in place.

# Context

The user answered: "i want to split furnis and share wallet", "should we have a share inventory and per habbo inventory?
so the gift goes to shared inventory for furnis and any habbo can see it?", "i want to move habbo furnis to a share
furni inventory, what about placed furnis and rooms?" and "we can design a system to allow the user to move rooms from
one habbo to another, it's hard to place lots of furnis and decorate rooms, so this way we can just have the creator and
the owner of rooms." Moving rooms to the active habbo is the agent's reading, because an archived habbo is never the
active one.

# Consequences

- Nothing is built until the game server exists ([0013](/decisions/0013-defer-game-server-features.md)).
