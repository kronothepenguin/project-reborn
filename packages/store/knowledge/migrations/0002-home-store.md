---
type: SQL Update
title: 0002-home-store.sql
description: Writes Holo's home store, its 20 categories and 298 items with Holo's ids, keeping the rows already there.
resource: packages/store/migrations/0002-home-store.sql
tags: [store, update, homes]
timestamp: 2026-11-03T21:54:04+00:00
---

# Update

| | |
|---|---|
| Title | Holo's home store: its 20 categories and 298 items, with Holo's ids. |
| Automatic | no |

Writes the categories of [home_store_categories](/tables/home_store_categories.md) and the items of
[home_store_items](/tables/home_store_items.md) from Holo's `install.php`, leaving out the four items whose art is gone
and the one Holo never wrote. `INSERT OR IGNORE` keeps every row already there, so a store an administrator changed stays
as it is.

`packages/cms/seed` holds the ids of the Backgrounds and Notes categories, and the art the items show.
