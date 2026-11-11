---
type: Entity
title: Catalogue page
description: A page of the catalogue with its layout, images and texts, shown to the habbos its level and the club allow, which sells catalogue items.
tags: [store, entity, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Definition

The catalogue is a list of pages, in the order of their `position`. A page has the client's layout, which places its
header, its teasers and its numbered texts, and it sells [catalogue items](/entities/catalogue-item.md).

# Invariants

- Its `code` is unique: the client asks for a page, and buys from it, by its code, and the client's recycler reads the
  page `Recycler`.
- A habbo sees a page when the highest level of its access groups reaches `min_level`, or when the page is
  `open_to_club` and the habbo's user is a club member
  (`plans/server/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md`).
- A `club_only` page sells only to club members, and everyone who sees it may read it
  (`plans/server/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md`).
- A page's texts are numbered from 1, and the client lists them by number.

# Lifecycle

- The update [0013-catalogue.sql](/migrations/0013-catalogue.md) seeds Holo's pages, with six names in English
  (`plans/server/decisions/0099-the-catalogues-page-names-are-english.md`) and without the pages that wait for S7
  (`plans/server/decisions/0101-the-pages-of-s7s-furni-wait-for-s7.md`). Another update adds or changes one; no page of
  the site edits them (`plans/server/decisions/0091-holos-catalogue-changed-by-updates.md`).

# Vocabularies

| `layout` | Page |
|----------|------|
| `ctlg_layout2` | Most pages: a list of furni |
| `ctlg_frontpage2`, `ctlg_purse`, `ctlg_collectibles`, `ctlg_norares`, `ctlg_presents` | Pages of text and images that sell nothing |
| `ctlg_productpage1` | One product, the rare of the moment |
| `ctlg_spaces` | Wallpapers, floors and landscapes, with a preview |
| `ctlg_plasto` | Plastic furni, an item and a colour |
| `ctlg_trophies` | Trophies, with an inscription |
| `ctlg_recycler` | The recycler |

The client holds a script for each layout; a new one needs the client's cast.

# Relations

- Sells [catalogue items](/entities/catalogue-item.md).

# Tables

- [catalogue_pages](/tables/catalogue_pages.md)
- [catalogue_page_texts](/tables/catalogue_page_texts.md)

# Queries

- [catalogue.query.sql](/queries/catalogue.md)
