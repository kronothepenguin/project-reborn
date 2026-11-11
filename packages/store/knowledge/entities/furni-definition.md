---
type: Entity
title: Furni definition
description: What a kind of furni is, apart from who sells it: its sprite, where it stands, its size and colours, and what may be done with it.
tags: [store, entity, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Definition

A furni definition says what a furni is. Every piece of furni a habbo owns is of one definition, and the catalogue's
items, the recycler's rewards and the present boxes name definitions
(`plans/server/decisions/0097-furni-definitions-and-catalogue-items-apart.md`).

# Invariants

- A wall item has no size, height or colours, and a floor furni carries no data.
- A definition is sold by several catalogue items or by none: the Mummy poster is on two pages, and the recycler's
  rewards and the six present boxes are on none.
- A sprite does not name one definition: colours and sizes make several of it.

# Lifecycle

- The update [0013-catalogue.sql](/migrations/0013-catalogue.md) seeds Holo's definitions, one for the rows of Holo's
  catalogue that repeat a furni. Another update adds or changes one; no page edits them
  (`plans/server/decisions/0091-holos-catalogue-changed-by-updates.md`).

# Vocabularies

| `kind` | Stands | In a room |
|--------|--------|-----------|
| `wall` | On a wall | A poster, a window; also the wallpaper, floor and landscape a room uses up |
| `solid` | On the floor | Blocks its tiles; another furni may stand on it |
| `seat` | On the floor | A habbo sits on it |
| `bed` | On the floor | A habbo lies on it |
| `rug` | On the floor | Habbos walk over it |
| `roller` | On the floor | Habbos walk onto it, and it carries what stands on it to the next tile |

# Relations

- [Catalogue items](/entities/catalogue-item.md) give it.

# Tables

- [furni_definitions](/tables/furni_definitions.md)

# Queries

- [catalogue.query.sql](/queries/catalogue.md)
