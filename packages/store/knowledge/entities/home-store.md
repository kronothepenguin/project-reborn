---
type: Entity
title: Home store
description: The catalogue of stickers, note packs and backgrounds for homes, and each habbo's inventory of bought items.
tags: [store, entity, homes]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Habbos spend credits in the home store; a purchase adds `quantity` units of the item to the habbo's inventory, and
placing an item on a home takes it out again.

# Invariants

- Prices are ≥ 0 and each purchase grants at least one unit.
- Inventory quantities never go below zero.
- Items referenced by a home or an inventory cannot be deleted; they are disabled (`enabled = FALSE`).
- Staff-only categories are visible only with `homes.staffItems`.

# Lifecycle

- The installer seeds Holo's categories and items; housekeeping adds and edits items.
- A purchase debits the wallet, writes a ledger row and adds to the inventory in one transaction.

# Vocabularies

| Column | Values |
|--------|--------|
| `home_store_items.kind` | `sticker`, `note`, `background` |
| `home_store_items.asset` | asset key of the re-hosted image |

# Relations

- Items are placed on [homes](/entities/home.md) and bought from a habbo's [wallet](/entities/wallet.md).

# Tables

- [home_store_categories](/tables/home_store_categories.md)
- [home_store_items](/tables/home_store_items.md)
- [home_inventory](/tables/home_inventory.md)
