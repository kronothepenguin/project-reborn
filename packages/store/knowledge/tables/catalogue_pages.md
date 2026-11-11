---
type: SQLite Table
title: catalogue_pages
description: A page of the catalogue: its place in the list, its code for the client, its name, layout, images and texts, and who sees it and buys from it.
resource: packages/store/schema/catalogue.schema.sql
tags: [store, table, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Schema

| Column | Type | Null | Default | Description | Key / reference |
|--------|------|------|---------|-------------|-----------------|
| `id` | INTEGER | no | | Page; a seeded one keeps Holo's id | primary key |
| `position` | INTEGER | no | | Its place in the catalogue's list, lowest first | |
| `code` | TEXT | no | | The page's id for the client, which reads the page `Recycler` by that name | unique |
| `name` | TEXT | no | | Name the catalogue's list shows | |
| `layout` | TEXT | no | | The client's layout, which also picks the page's script, such as `ctlg_spaces` | |
| `header_image` | TEXT | no | `''` | The client's `g` | |
| `teaser_images` | TEXT | no | `''` | The client's `e`, comma-separated, with no empty image | |
| `header_text` | TEXT | no | `''` | The client's `h`; `<br>` breaks a line | |
| `teaser_text` | TEXT | no | `''` | The client's `w` | |
| `special_text` | TEXT | no | `''` | The client's `s` | |
| `min_level` | INTEGER | no | 0 | Access group level a habbo needs to see the page | CHECK ≥ 0 |
| `open_to_club` | BOOLEAN | no | FALSE | Club members see the page below `min_level` | |
| `club_only` | BOOLEAN | no | FALSE | Only club members buy from the page | |

# Keys

- Primary key `id`; unique `code`.

# Notes

- The update [0013-catalogue.sql](/migrations/0013-catalogue.md) seeds 67 of Holo's pages: 16 at level 7, Greek and
  Advertisement at level 2 and open to the club, and Club Furni for club members only
  (`plans/server/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md`,
  `plans/server/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md`).

# Related

- Entity: [Catalogue page](/entities/catalogue-page.md).
- Queries: [catalogue.query.sql](/queries/catalogue.md).
