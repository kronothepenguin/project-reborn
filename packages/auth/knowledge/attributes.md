---
type: Reference
title: Attributes, levels and fuses
description: What a user may do on the site, who they may act on, and the rights of their habbos in the game client.
---

# Attributes

The `Attribute` constants and `Catalogue()` (name and description) follow decision holo-port/0015.
`Attributes(ctx, db, userID)` returns the attributes of the user's access groups and those given to the user directly.

# Levels

- `Level(ctx, db, userID)` is the highest level of the user's access groups, and 0 without a group. Direct attributes
  leave it as it is.
- `Outranks(ctx, db, actor, target)` reports whether the actor's level is strictly above the target's. Every action of
  staff on a user asks it (decision holo-port/0055).

# Fuses

- `Fuse` constants are the R26 client's rights by their exact names. Access groups grant them through the same table as
  attributes (decision server/0045).
- `FuseCatalogue()` lists the fuses access groups grant, for housekeeping's checkboxes.
- `Fuses(ctx, db, userID)` returns `fuse_trade` and `fuse_buy_credits` for everyone, the club fuses while the user's
  club runs, and the catalogue's fuses of the user's access groups.
