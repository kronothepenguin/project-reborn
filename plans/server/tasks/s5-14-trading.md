---
type: Task
title: Trade furni
description: Two habbos in a room offer furni from their hands and accept; when both have, every piece changes hands in one transaction, and a trade cut short loses nothing.
status: todo
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/virtual, packages/server]
client: ["packages/client-r26/src/game/hh_room_utils/3_Safe Trader Class.ls", "packages/client-r26/src/game/hh_room/3_Room Interface Class.ls", "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

Habbos trade furni safely ([0092](/decisions/0092-a-trade-lives-only-in-memory.md),
[hh_room](/reference/r26/hh_room.md#trading)).

# Steps

- [ ] `TRADE_OPEN` (71) opens a trade with a habbo in the room: both show `trd` and get 108; 102 or 103 refuses it. The
  open trade lives in the loaded room ([0098](/decisions/0098-virtual-furni-and-catalogue.md)).
- [ ] `TRADE_ADDITEM` (72) offers a tradeable furni of the hand and takes both accepts away; `TRADE_ACCEPT` (69) and
  `TRADE_UNACCEPT` (68) change a side, 109.
- [ ] When both have accepted, every furni offered changes hands in one transaction, and both get the trade's end
  ([0092](/decisions/0092-a-trade-lives-only-in-memory.md)).
- [ ] `TRADE_CLOSE` (70), leaving the room or a lost connection closes the trade for both, 110.
- [ ] Tests with the Go test client, a trade cut short among them.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/virtual && go vet ./... && go test ./... -race
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-trading`.
- To settle before it starts:
  - Where habbos trade; the client reads a room's trading flag, which a room takes from its category.
  - How many furni a side offers.
  - Whether a furni on offer can still be placed, given or recycled while the trade is open.
