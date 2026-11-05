---
type: Entity
title: Home
description: A decorated home page owned by a profile or a group, with stickers, sticky notes, widgets and a background.
tags: [store, entity, homes]
timestamp: 2026-11-05T21:21:56+00:00
---

# Definition

A home is the page a habbo or a group decorates. Items are placed at pixel positions with a stacking order, and the
background is a bought background item or the default.

# Invariants

- A home belongs to exactly one profile or one group, and each has at most one home.
- A sticker or a note references the store item it came from, so that it can go back to the inventory; widgets do not.
- A home holds at most `homes.maxItems` items (validated in Go).
- Only the owner, or an admin of the owning group, edits the home; permission is checked on every request.

# Lifecycle

- Created with its profile or group; a profile's home starts with its profile widget at Holo's place, 25 and 25.
- Items are placed from the inventory (a sticker or note leaves it), moved, re-skinned and removed; a removed
  sticker goes back to the inventory of the user whose habbo placed it, and a removed profile or Group information
  widget goes back to its place. A removed note is gone from a habbo's home, and goes back blank to its placer from a
  group's.
- A group's home takes one Group Members widget from the inventory's Widgets tab; widgets come from no inventory.
- Deleted with its profile or group, together with its items.

# Vocabularies

| Column | Values |
|--------|--------|
| `home_items.kind` | `sticker`, `note`, `widget` |
| `home_items.widget` | `profile` and `groups` on habbo homes; `group_info` and `members` on group homes |
| `home_items.skin` | `defaultskin`, `speechbubbleskin`, `metalskin`, `noteitskin`, `notepadskin`, `goldenskin`; `hc_machineskin` and `hc_pillowskin` for club habbos; `nakedskin` with `homes.staffItems` |

# Relations

- Owned by a [profile](/entities/profile.md) or a [group](/entities/group.md).
- Uses [home store](/entities/home-store.md) items for stickers and the background.

# Tables

- [homes](/tables/homes.md)
- [home_items](/tables/home_items.md)

# Queries

- [homes.query.sql](/queries/homes.md)
