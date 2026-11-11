---
type: Task
title: Show the catalogue
description: GCIX lists the catalogue's pages a habbo may see as 126, and GCAP sends a page with its texts, images and items as 127.
status: done
phase: s5
depends_on: [s5-02]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_cat_code/3_Catalogue Interface Class.ls", "packages/client-r26/src/game/hh_cat_code/4_Catalogue Component Class.ls", "packages/client-r26/src/game/hh_cat_code/5_Catalogue Handler Class.ls"]
timestamp: 2026-11-11T16:11:17+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:11:17+00:00"}
---

# Goal

A habbo opens the catalogue and reads its pages ([hh_cat_code](/reference/r26/hh_cat_code.md)).

# Steps

- [x] `GCIX` (101) answers 126 with the pages the habbo sees, by its access group level and its club membership
  ([0100](/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md)), in their order.
- [x] `GCAP` (102) answers 127 with the page: its id, name, layout, images and texts, and a `p` line per item, a deal's
  with the furni it gives. A `p` line's purchase code names the catalogue item, since a sprite does not.
- [x] A page the habbo may not see is not sent.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.CataloguePages` returns the pages a habbo sees, in the catalogue's order, and `game.CataloguePage` one of them
  by its code: a habbo sees a page when its access group level reaches the page's, or when the page is open to the club
  and its user is a member ([0100](/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md)). Both read the level
  and the club from the store each time, since the site changes them.
- `r26/cat_code.go` answers `GCIX` (101) with 126, a line per page, its code, a tab and its name, and `GCAP` (102) with
  127: `i`, `n` and `l`, then those the page has of `g`, `e`, `h`, `w` and `s`, its numbered texts as `t<n>`, and a `p`
  line for each item. The edit mode and the language change nothing.
- A `p` line is name, description, price, an empty special text, the object type, the class, the direction, the
  dimensions, the purchase code and the part colours, tab-separated: `s` for a floor furni, with direction 0 and its
  length and width; `i` for a wall item, whose class is the sprite and its data, as in `poster 44`; and `d` for a deal,
  followed by the count of its furni and each one's class, pieces and colours. The purchase code is the item's code
  ([s5-01](/tasks/s5-01-catalogue-tables.md)), so the pet food packs keep the client's pictures `ctlg_pic_deal97` to
  `ctlg_pic_deal99`.
- A page that does not exist or that the habbo does not see gets no answer. Holo sent a page of its own,
  `holo.cast.catalogue.access_denied`, which the client drops for having no id. The client lists only what 126 names and
  keeps the index for the session, so only a forged or stale request asks for such a page.
- A tab, a line break or another control character in a value becomes a space, so no text of the catalogue breaks a line
  or a `p` line's values.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestTheCatalogueListsThePagesAHabboSees`,
  49 pages for a habbo, 51 for a club member and 67 at level 7, `TestACataloguePageComesWithWhatItSells`,
  `TestAHiddenCataloguePageIsNotSent` and, in `r26`, `TestAProductLineByKindOfItem`. `make gates` passes.

# Notes

- Runs on the branch `s5-showing-the-catalogue`.
- Chosen without asking: a page the habbo does not see gets no answer, where Holo sent a page of its own.
