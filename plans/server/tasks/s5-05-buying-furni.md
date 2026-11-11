---
type: Task
title: Buy furni
description: GPRC buys a catalogue item with the user's credits in one transaction, and the furni lands in the buyer's hand, with deals, trophies and decorations.
status: done
phase: s5
depends_on: [s5-03, s5-04]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_cat_code/4_Catalogue Component Class.ls", "packages/client-r26/src/game/hh_cat_code/5_Catalogue Handler Class.ls", "packages/client-r26/src/game/hh_cat_code/9_Catalogue spaces Class.ls", "packages/client-r26/src/game/hh_cat_code/11_Catalogue trophies Class.ls"]
timestamp: 2026-11-11T16:33:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:33:05+00:00"}
---

# Goal

A habbo buys furni with its user's credits ([hh_cat_code](/reference/r26/hh_cat_code.md#buying)).

# Steps

- [x] `GPRC` (100) buys an item of a page the habbo may see: the user's wallet pays the price, the credit history gets
  its line and the furni lands in the buyer's hand, in one transaction; the client gets 67 and the new balance as 6.
- [x] 68 when the credits are not enough, 65 for an item the page does not sell, and 296 with 1 when the page sells only
  to club members and the habbo is not one ([0102](/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md));
  none of them charges.
- [x] A deal gives every furni of it. A trophy keeps the buyer's name, the day and the inscription; a wallpaper, a floor
  and a landscape keep the pattern the buyer chose.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.Buy` buys an item of a page, both named by their codes, for a habbo that sees the page
  ([0100](/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md)). In one transaction the wallet of the habbo's
  user pays the price, guarded so that it never goes below zero, its history gets the line `Catalogue purchase (<item>)`
  under the new reason `catalogue`, and each piece the item gives becomes a furni in the buyer's hand. The level, the
  club and the wallet are read from the store.
- `r26/cat_code.go` handles `GPRC` (100), eight lines of text: 67 and 6 with the new balance; 68 when the credits are
  not enough; 296 with 1 on a page that sells only to club members
  ([0102](/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md)); and 65 for a page that does not exist or
  that the habbo does not see, or an item the page does not sell. None of the three charges.
- Holo never sent 67: it sent the hand, which opened it. On 67 the client shows the purchase as done and opens the hand
  by itself in a habbo room, so the server sends 67 and leaves the hand to the client's `GETSTRIP`.
- A deal gives every piece, six for a pet food pack. A furni bought on a page of the layout `ctlg_trophies` keeps the
  buyer's name, the day as dd-mm-yyyy and the inscription, cut at 150 characters, tab-separated, as the client's Trophy
  class reads its state. One bought on the `ctlg_spaces` page keeps the pattern, digits with at most one dot, and any
  other value is refused with 65. A pad of post-its starts with the state `20`.
- A gift, the sixth line 1, is refused with 65 until [s5-06](/tasks/s5-06-presents.md).
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestBuyingAFurniWithCredits`,
  `TestWhatAPurchaseLeavesInTheHand` and `TestWhoMayBuy`. `make gates` passes.

# Notes

- Runs on the branch `s5-buying-furni`.
- Chosen without asking: the credit history's line reads `Catalogue purchase (<item>)`, in the style of HoloCMS's
  lines, and a pad of post-its holds 20 notes, as Holo's.
