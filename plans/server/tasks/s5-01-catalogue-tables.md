---
type: Task
title: Add the furni definitions and the catalogue to the store
description: The store gets the furni definitions, the catalogue's pages and its items, and an update that seeds Holo's catalogue, 67 pages, 1,256 furni and 1,275 items.
status: done
phase: s5
depends_on: []
packages: [packages/store]
client: []
timestamp: 2026-11-11T16:03:59+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:03:59+00:00"}
---

# Goal

The hotel knows what each furni is and what its catalogue sells
([0091](/decisions/0091-holos-catalogue-changed-by-updates.md),
[0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md)).

# Steps

- [x] Tables for the furni definitions, each with its sprite, colours, kind, size, height and whether it is a door,
  tradeable and recyclable; for the catalogue's pages, each with its layout, images, texts and the access group level a
  habbo needs to see it; and for the catalogue's items, each with its page, its place on it, its name, description and
  price, and the furni it gives, several for a deal
  ([0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md)).
- [x] An update with the tables that seeds Holo's catalogue from `source/holoemu/Resources/holodb.sql`, its pages, and
  its rows split into definitions and catalogue items, deals among them
  ([0091](/decisions/0091-holos-catalogue-changed-by-updates.md)).
- [x] The named queries that load them, tests, and the OKF concepts, with the `adding-data-persistence` skill.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
make gates
```

Results:

- `packages/store/schema/catalogue.schema.sql` declares `furni_definitions`, `catalogue_pages`, `catalogue_page_texts`,
  `catalogue_items` and `catalogue_item_furni` ([0097](/decisions/0097-furni-definitions-and-catalogue-items-apart.md)).
  A definition is a sprite, a kind, `wall`, `solid`, `seat`, `bed` or `rug` for Holo's types 0 to 4, a size, a height,
  colours, a wall item's data, and whether it is a door, tradeable and recyclable. A page has a position, a name, a
  layout, images and texts, the level a habbo needs, whether the club opens it and whether it sells only to the club
  ([0100](/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md),
  [0102](/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md)). An item gives the rows of
  `catalogue_item_furni`, a furni and how many pieces each.
- A page and an item each carry a `code`, unique, which is their id for the client. The client's recycler reads the page
  whose id is `Recycler`, so a page's code is Holo's index name. The client sends an item's code back to buy it, and
  shows the picture `ctlg_pic_<code>` when its cast holds one, as it does for `deal97` to `deal99`: a seeded deal keeps
  Holo's code, and a seeded furni's code is its id, because Holo's, the sprite, named several items at once, and a furni
  bought in Holo was always the first of them.
- The update `0013-catalogue.sql` seeds 67 pages, 15 numbered texts, 1,256 definitions and 1,275 items from the 76 pages
  and 1,372 rows of `source/holoemu/Resources/holodb.sql`
  ([0091](/decisions/0091-holos-catalogue-changed-by-updates.md)). The rows that repeat a furni share one definition, as
  the Mummy poster's two do; ten definitions are on no page, the recycler's three rewards, a tree and the six present
  boxes. Six page names are English ([0099](/decisions/0099-the-catalogues-page-names-are-english.md)).
- Holo's dump holds 10 deals, written in 19 rows of `catalogue_deals`, not the 19 deals that
  [0091](/decisions/0091-holos-catalogue-changed-by-updates.md) counts. The four pet food packs are seeded, six pieces
  for 2 credits each.
- Left out with the seven pages of [0101](/decisions/0101-the-pages-of-s7s-furni-wait-for-s7.md), by its rule and
  without an answer from the user, who dismissed the question: the Club Shop page, whose only furni is the Mood Light,
  the five sound sets and the jukebox of the Alhambra and Ver. 21 to 23 pages, and the song disk, which Holo sold on no
  page. [S7](/phases/s7-club-help-extras.md)'s scope lists them.
- Left out too, without an answer from the user: the Offers page, whose three deals cost 5 credits each, carry the name
  of one furni and give others, a Romantique Clock of 25 credits among them, and the three deals Holo sold on no page. A
  later update can add real offers.
- Holo kept a page's numbered texts in one column, each after the first behind a line feed that hid it from the client.
  Each is a row here, so the Spaces page shows its seven labels. The front page's `t1:` label, which Holo sent as its
  teaser text, is its text 1.
- Queries: `ListFurniDefinitions`, `ListCataloguePages`, `ListCataloguePageTexts`, `ListCatalogueItems` and
  `ListCatalogueItemFurni`, from which [s5-02](/tasks/s5-02-catalogue-state.md) loads.
- In `packages/store`, `go vet ./...` and `go test ./...` pass, with `TestANewDatabaseHasHolosCatalogue`;
  `make check-docs` exits 0, with 11 new concepts; and `go tool sqlc generate` leaves the generated files as they are.
  `make gates` passes, 31 packages.

# Notes

- Runs on the branch `s5-catalogue-tables`.
- Settled before it started: the six page names are English
  ([0099](/decisions/0099-the-catalogues-page-names-are-english.md)); a page keeps Holo's minimum rank as the level a
  habbo needs, and rank 2 opens it to the club ([0100](/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md));
  the pages of S7's furni are left out ([0101](/decisions/0101-the-pages-of-s7s-furni-wait-for-s7.md)); and Club Furni
  and Club Shop sell only to club members ([0102](/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md)).
