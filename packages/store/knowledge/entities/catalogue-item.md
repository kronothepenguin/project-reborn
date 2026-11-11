---
type: Entity
title: Catalogue item
description: Something a catalogue page sells for credits, which gives one piece of a furni or, as a deal, several.
tags: [store, entity, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Definition

A catalogue item is what a habbo buys on a [page](/entities/catalogue-page.md): a name, a description and a price in
credits, and the [furni](/entities/furni-definition.md) it gives.

# Invariants

- It is on one page, and it gives at least one furni.
- Its `code` is unique: the client buys an item by its code. Holo's code, the sprite, named several items at once, so a
  furni bought there was always the first of them.
- A deal is an item that gives more than one piece: Holo's four pet food packs give six of a furni each
  (`plans/server/decisions/0097-furni-definitions-and-catalogue-items-apart.md`).
- Its price is never negative.

# Lifecycle

- The update [0013-catalogue.sql](/migrations/0013-catalogue.md) seeds Holo's items, each with the id, the name, the
  description and the price of Holo's row. Another update adds or changes one; no page of the site edits them
  (`plans/server/decisions/0091-holos-catalogue-changed-by-updates.md`).

# Relations

- Sold by a [catalogue page](/entities/catalogue-page.md).
- Gives [furni definitions](/entities/furni-definition.md).

# Tables

- [catalogue_items](/tables/catalogue_items.md)
- [catalogue_item_furni](/tables/catalogue_item_furni.md)

# Queries

- [catalogue.query.sql](/queries/catalogue.md)
