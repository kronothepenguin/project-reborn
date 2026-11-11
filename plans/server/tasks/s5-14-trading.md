---
type: Task
title: Trade furni
description: Two habbos in a room offer furni from their hands and accept; when both have, every piece changes hands in one transaction, and a trade cut short loses nothing.
status: done
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room_utils/3_Safe Trader Class.ls", "packages/client-r26/src/game/hh_room/3_Room Interface Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T18:42:03+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:42:03+00:00"}
---

# Goal

Habbos trade furni safely ([0092](/decisions/0092-a-trade-lives-only-in-memory.md),
[hh_room](/reference/r26/hh_room.md#trading)).

# Steps

- [x] `TRADE_OPEN` (71) opens a trade with a habbo in the room: both show `trd` and get 108; 102 or 103 refuses it. The
  open trade lives in the loaded room ([0098](/decisions/0098-virtual-furni-and-catalogue.md)).
- [x] `TRADE_ADDITEM` (72) offers a tradeable furni of the hand and takes both accepts away; `TRADE_ACCEPT` (69) and
  `TRADE_UNACCEPT` (68) change a side, 109.
- [x] When both have accepted, every furni offered changes hands in one transaction, and both get the trade's end
  ([0092](/decisions/0092-a-trade-lives-only-in-memory.md)).
- [x] `TRADE_CLOSE` (70), leaving the room or a lost connection closes the trade for both, 110.
- [x] Tests with the Go test client, a trade cut short among them.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

Results:

- An open trade lives in the loaded room ([0092](/decisions/0092-a-trade-lives-only-in-memory.md),
  [0098](/decisions/0098-virtual-furni-and-catalogue.md)): `packages/virtual/room` gained `Trade`, with `OpenTrade`,
  `OfferFurni`, `AcceptTrade`, `TradeOf` and `CloseTrade`, and `Leave` ends the trade of the habbo that goes.
- `TRADE_OPEN` (71) opens a trade with a habbo of the room, in any room
  ([0112](/decisions/0112-habbos-trade-in-any-room.md)): both show `trd` and get 108; 102 and 103 refuse a habbo without
  `fuse_trade`. `TRADE_ADDITEM` (72) offers a tradeable furni of the hand once, up to the new setting
  `game.maxTradeFurni`, 65 ([0113](/decisions/0113-a-trade-side-offers-up-to-a-setting.md)), and takes both accepts
  away. `TRADE_ACCEPT` (69) and `TRADE_UNACCEPT` (68) tell both with 109.
- When both have accepted, the trade closes and the store's new `TradeFurni` moves every furni to the other habbo and
  its user in one transaction; a furni that left its hand undoes it all. Both get 110. `TRADE_CLOSE` (70), leaving the
  room or a lost connection ends the trade for both with nothing changed.
- A furni on offer is locked ([0114](/decisions/0114-a-furni-on-offer-is-locked.md)): it is not placed, hung or used up
  on the room while its trade is open.
- The hand, and the trade with it, lists a wall item's state when it has one, so a pad of post-its shows its notes.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/virtual`,
  `go test ./... -race` passes, with `TestATradeLivesInTheRoom`. In `packages/server`, `go test ./... -race` passes,
  with `TestTrading` and `TestATradeCutShortLosesNothing`. `make gates` passes.

# Notes

- Runs on the branch `s5-trading`.
- Settled before it started: habbos trade in any room ([0112](/decisions/0112-habbos-trade-in-any-room.md)), a side
  offers up to `game.maxTradeFurni`, 65 ([0113](/decisions/0113-a-trade-side-offers-up-to-a-setting.md)), and a furni on
  offer is locked ([0114](/decisions/0114-a-furni-on-offer-is-locked.md)).
- Chosen without asking, as Holo had it: taking one accept away takes both; a trade that completes ends with 110, which
  makes the client ask for its hand again, and 105 and 112 are never sent; adding a furni or opening the trade sends 108
  to both, and an accept 109. Beyond Holo: only a furni marked tradeable is offered, and only once; `fuse_trade`, which
  every habbo holds, is asked of both, with 102 and 103.
- Found on the way: the hand listed a wall item with its definition's data only, so a pad of post-its showed no count.
  The hand and the trade now list a wall item's state when it has one.
