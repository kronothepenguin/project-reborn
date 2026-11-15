---
type: SQL Update
title: 0013-catalogue.sql
description: Creates the furni definitions and the catalogue's tables, and seeds Holo's English catalogue: 67 pages, 1,256 furni and 1,275 items.
resource: packages/store/migrations/0013-catalogue.sql
tags: [store, update, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Update

| | |
|---|---|
| Title | The furni definitions and the catalogue's pages and items, with Holo's catalogue. |
| Automatic | no |

Creates [furni_definitions](/tables/furni_definitions.md), [catalogue_pages](/tables/catalogue_pages.md),
[catalogue_page_texts](/tables/catalogue_page_texts.md), [catalogue_items](/tables/catalogue_items.md) and
[catalogue_item_furni](/tables/catalogue_item_furni.md), and seeds, with fixed ids, the catalogue of
`source/holoemu/Resources/holodb.sql` (`knowledge/decisions/server/0091-holos-catalogue-changed-by-updates.md`):

- 1,256 furni definitions. Each row of Holo's `catalogue_items` is split into what the furni is and what a page sells
  (`knowledge/decisions/server/0097-furni-definitions-and-catalogue-items-apart.md`); the rows that repeat a furni share one
  definition, which keeps the id of the first. A sprite of two words, such as `poster 44`, is the sprite and a wall
  item's data. Ten definitions are on no page: the recycler's three rewards, a tree and the six present boxes.
- 67 pages, with Holo's ids as their ids and their positions, and 15 numbered texts. Holo's rank 1 is level 0; rank 7 is
  level 7; rank 2, its club rank, is level 2 and open to the club
  (`knowledge/decisions/server/0100-sixteen-pages-need-level-7-and-two-the-club.md`). Six names are English
  (`knowledge/decisions/server/0099-the-catalogues-page-names-are-english.md`), and Club Furni sells only to club members
  (`knowledge/decisions/server/0102-club-furni-and-club-shop-sell-to-club-members.md`).
- 1,275 catalogue items with Holo's ids, names, descriptions and prices, each giving one furni, and four of them, the
  pet food packs, six pieces of it. An item's code is its id, and a pack keeps Holo's code, `deal96` to `deal99`.

Left out until S7 builds what they sell (`knowledge/decisions/server/0101-the-pages-of-s7s-furni-wait-for-s7.md`): the pages
Pets, Camera, the five Trax pages and Club Shop, whose only furni is the Mood Light, with their furni; the five sound
sets and the jukebox of other pages; and the song disk. Also left out: the Offers page, whose three deals give furni
that their names do not say, and the three deals Holo sold on no page.

Holo kept a page's numbered texts in one column with a line feed before all but the first, which hid them from the
client; here each is a row. The front page's `t1:` label is its text 1.

The update holds the data itself, read once from the dump; nothing reads the dump when a program runs.
