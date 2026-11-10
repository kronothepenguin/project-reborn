---
type: Task
title: Add the fuse catalogue
description: A habbo's fuses are the default set, the club fuses for club members, and the staff fuses their access groups grant, from a fuse catalogue beside the site's attributes.
status: done
phase: s2
depends_on: []
packages: [packages/auth, packages/housekeeping, packages/store, packages/installer]
client: []
timestamp: 2026-11-10T02:04:23+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:04:23+00:00"}
---

# Goal

A habbo's fuses follow [0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md): `fuse_trade` and
`fuse_buy_credits` for everyone, Holo's four club fuses for club members, and the fuses their access groups grant, which
the groups first hold by Holo's ranks ([0046](/decisions/0046-the-first-fuses-follow-holos-ranks.md)).

# Steps

- [x] A fuse catalogue in `packages/auth`, beside the site's attributes, with the 31 fuses of
  [0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md), each with its name and what it allows in the
  game.
- [x] Access groups grant fuses as they grant attributes, and housekeeping's access groups show them as checkboxes; a
  user's direct attributes take none.
- [x] A function returns a habbo's fuses: `fuse_trade` and `fuse_buy_credits`; `fuse_use_club_dance`,
  `fuse_use_special_room_layouts`, `fuse_habbo_chooser` and `fuse_furni_chooser` while the habbo's club is active; and
  the catalogue's fuses of its user's access groups.
- [x] An update gives every access group the fuses of Holo's ranks up to its level
  ([0046](/decisions/0046-the-first-fuses-follow-holos-ranks.md)).
- [x] Tests: the catalogue, the checkboxes, the update, and a habbo's fuses with and without club and groups.

# Verification

```sh
cd packages/auth && go test ./... -race
cd packages/housekeeping && go test ./... -race
cd packages/store && go test ./... && make check-docs
cd packages/installer && go test ./...
make gates
```

Results:

- `packages/auth/fuses.go`: the fuse catalogue, `FuseCatalogue()`, with the 31 fuses of
  [0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md), each with what it allows in the game, checked
  against the client's scripts and Holo's server; and `Fuses(ctx, db, userID)`, which returns `fuse_trade` and
  `fuse_buy_credits`, the four club fuses while the user's club runs (read with `GetClubEnd`, as the CMS reads it), and
  the catalogue's fuses of the user's access groups, each once.
- Housekeeping's access group page shows the fuses as checkboxes under the attributes, and saving keeps and logs them as
  it does attributes. Names outside the two catalogues, such as Holo's `fuse_login`, or `fuse_trade`, are refused, and a
  user's direct attributes take no fuse.
- The update `0009-holo-fuses.sql` gives every access group the fuses of Holo's ranks up to its level
  ([0046](/decisions/0046-the-first-fuses-follow-holos-ranks.md)): a new hotel's ranks hold 6, 10, 16, 22 and 31.
- The analysis of Holo's fuses is in [The Holograph Emulator](/reference/holoemu.md#fuses), and Holo's chat commands
  wait in `plans/later.md`.
- `go test ./... -race` passes in `packages/auth`, with `TestFuseCatalogue`, `TestEveryHabboHoldsTheDefaultFuses`,
  `TestClubMembersHoldTheClubFusesWhileTheClubRuns`, `TestAccessGroupsGrantFuses` and
  `TestANewHotelsAdministratorHoldsEveryFuse`, and in `packages/housekeeping`, with `TestTheGroupPage`,
  `TestSavingAGroupsFuses`, `TestOnlyTheCatalogueFusesCanBeGiven` and `TestFusesAreNotGivenDirectly`.
- `go test ./...` passes in `packages/store`, with `TestTheRanksHoldHolosFusesUpToTheirLevel` and
  `TestAHotelsOwnGroupsGetHolosFusesByLevel`, and `make check-docs` exits 0. In `packages/installer`,
  `TestAnInstalledHotelHasHolosRanks` counts the ranks' fuses apart from their attributes and passes. The CMS suite
  passes.
- The OKF concepts of the update, the access group entity and `access_group_attributes` are added or updated.

# Notes

- Runs on the branch `s2-fuse-catalogue`.
- [0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md) and
  [0046](/decisions/0046-the-first-fuses-follow-holos-ranks.md) superseded
  [0031](/decisions/0031-fuses-defaults-club-and-access-groups.md) while the task ran, after the user asked for Holo's
  fuses to be read: the goal and the steps follow them.
