---
type: Task
title: Check S5's exit criteria
description: From the merged work, check every exit criterion of S5 and close the phase.
status: done
phase: s5
depends_on: [s5-01, s5-02, s5-03, s5-04, s5-05, s5-06, s5-07, s5-08, s5-09, s5-10, s5-11, s5-12, s5-13, s5-14, s5-15, s5-16, s5-17, s5-18, s5-19, s5-20, s5-22]
packages: [packages/server, packages/store, packages/virtual, packages/cms, packages/housekeeping]
client: []
timestamp: 2026-11-12T16:33:18+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-12T16:33:18+00:00"}
---

# Goal

S5 is done ([S5](/phases/s5-furni-catalogue.md#exit-criteria)).

# Steps

- [x] Each exit criterion checked against the merged work, with a test that covers it end to end where none does.
- [x] `make install` leaves no tracked change, and every gate passes.
- [x] S5 is `done` in its phase file, the phase index and the bundle's index, and the next phase's open questions are
  ready to ask.

# Verification

```sh
make install && git status --short
cd packages/server && go test ./... -race
make gates
```

Results:

- Checked on the merged work of s5-01 to s5-20 and s5-22, `main` at `90740853`.
- "A new hotel has Holo's catalogue: Go test clients open it, read its pages and buy a furni, a deal, a trophy and a
  wallpaper; the user's wallet pays, and the credit history shows each purchase": `TestAHabboShopsInHolosCatalogue`,
  added here, reads the index and the Rollers page, buys the four, and finds the wallet at 78 of 100 and the four lines
  in the history; with `TestTheCatalogueListsThePagesAHabboSees`, `TestACataloguePageComesWithWhatItSells`,
  `TestBuyingAFurniWithCredits` and `TestWhatAPurchaseLeavesInTheHand`. Passes.
- "What is bought lands in the buyer's hand, read from the database; a present lands in the receiver's hand in a box,
  and opens in a room": the same test reads the nine furni of the hand from the store; `TestTheHandComesAPageAtATime`,
  `TestAPresentWaitsInItsReceiversHand` and `TestOpeningAPresent`. Passes.
- "Habbos with rights place, move and turn furni, and it is picked up again; habbos walk around it, sit on seats and lie
  on beds, and rollers move them; furni and its state come back after the room unloads and after a restart":
  `TestFurnishingARoom`, `TestARoomShowsItsFurniAndHabbosUseIt` and `TestRollersCarryFurniAndHabbos`; and
  `TestFurniAndItsStateComeBackWithTheRoom`, added here, which places, moves and turns a lamp, switches it on, hangs a
  poster, lets the room unload and finds them as they were when it loads again. A room keeps nothing but the store once
  it unloads ([0010](/decisions/0010-hot-data-written-at-once.md)), and a restart leaves the same store, so the test of
  the unloading is the test of the restart: no test stops the server. Passes.
- "Dice, wheels, gates, drinks, post-its, teleports and decorations work as the client shows them, and credit furni
  turns into credits": `TestUsingFurni`, `TestPostIts`, `TestTeleports`, `TestDecoratingARoom` and
  `TestRedeemingCreditFurni`. Passes.
- "Two habbos trade furni in a room, and a trade cut short loses nothing": `TestTrading` and
  `TestATradeCutShortLosesNothing`, with `packages/virtual`'s `TestATradeLivesInTheRoom`. Passes.
- "A habbo recycles furni for a reward, and a recycling survives a restart": `TestRecycling`. A recycling lives in the
  store alone, and its state is counted from its saved start ([0093](/decisions/0093-a-recycling-is-saved.md)); the test
  moves that start back to pass the hour and the 7 days. Passes.
- "On the site, a habbo redeems an item voucher and takes furni from the shared inventory, and housekeeping has Recycler
  Options and the dashboard's counts of rooms and furni": `packages/cms`'s `TestRedeemingAnItemVoucherFillsTheHand` and
  `TestArchivingSharesFurniAndTheFurniPageTakesIt`; `packages/housekeeping`'s `TestCreatingAnItemVoucher`,
  `TestRecyclerOptionsSavesTheRecyclersSettings` and `TestTheDashboardCounts`. Passes.
- "Every gate passes": `make install` exits 0 and changes no tracked file; `go test ./... -race -v` in `packages/server`
  passes its 166 tests; `make gates` exits 0, with 33 packages `ok`.
- `TestTrading` failed one run in several, in the gates too: it sent two messages that must be refused on one connection
  and opened the trade on another, and the server read the two in either order. It now waits for an answer on the first
  connection, and passed 25 runs of 25.
- `packages/server/README.md` lists S5's test files, and [the architecture](/reference/architecture.md) what S5 added:
  the furni and the catalogue in memory, the room's copy of its furni, the trade in the loaded room and the recycling in
  the store.
- [S5](/phases/s5-furni-catalogue.md) is done. [S6](/phases/s6-friends.md) is next, once its five open questions are
  answered.

# Notes

- Runs on the branch `s5-exit-check`.
