---
type: Entity
title: Home store
description: The catalogue of stickers, note packs and backgrounds for homes, and each user's inventory of bought items.
tags: [store, entity, homes]
timestamp: 2026-11-02T01:44:57+00:00
---

# Definition

Habbos spend the user's credits in the home store; a purchase adds `quantity` units of the item to the user's inventory, so all their habbos can place it, and
placing an item on a home takes it out again.

# Invariants

- Prices are ≥ 0 and each purchase grants at least one unit.
- Inventory quantities never go below zero.
- Items referenced by a home or an inventory cannot be deleted; they are disabled (`enabled = FALSE`).
- Staff-only categories are visible only with `homes.staffItems`.

# Lifecycle

- The installer writes the CMS's seed of Holo's categories and items, with Holo's ids, and nothing else writes it; housekeeping adds and edits items.
- A purchase debits the wallet, writes a `store` ledger row and adds to the inventory in one transaction.
- A background is bought once and stays in the inventory, however many homes show it
  ([0064](/decisions/0064-backgrounds-are-unlocks.md)).

# Vocabularies

| Column | Values |
|--------|--------|
| `home_store_items.kind` | `sticker`, `note`, `background` |
| `home_store_items.asset` | the image's path under the CMS's public files, such as `c_images/stickers/trax_sfx.gif` |

# Relations

- Items are placed on [homes](/entities/home.md) and bought from a habbo's [wallet](/entities/wallet.md).

# Tables

- [home_store_categories](/tables/home_store_categories.md)
- [home_store_items](/tables/home_store_items.md)
- [home_inventory](/tables/home_inventory.md)

# Queries

- [home-store.query.sql](/queries/home-store.md)
- [home-inventory.query.sql](/queries/home-inventory.md)
