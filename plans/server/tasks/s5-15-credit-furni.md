---
type: Task
title: Turn credit furni into credits
description: CONVERT_FURNI_TO_CREDITS destroys a coin, a sack or a gold bar that stands in the habbo's room and adds its worth to the user's wallet.
status: done
phase: s5
depends_on: [s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/24_Credit Redeem Confirmation Class.ls", "packages/client-r26/src/game/hh_furni_classes/25_Credit Furni Class.ls"]
timestamp: 2026-11-11T18:45:45+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:45:45+00:00"}
---

# Goal

The Habbo Exchange's furni turns back into credits ([hh_room](/reference/r26/hh_room.md), `CONVERT_FURNI_TO_CREDITS`).

# Steps

- [x] `CONVERT_FURNI_TO_CREDITS` (183) destroys the credit furni and adds its worth to the user's wallet, with a line in
  the credit history, in one transaction; the room sees 94 and the habbo its balance as 6.
- [x] Any other furni is refused.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.RedeemFurni` handles `CONVERT_FURNI_TO_CREDITS` (183) for the room's owner
  ([0115](/decisions/0115-the-rooms-owner-redeems-credit-furni.md)): in one transaction the furni is deleted, the wallet
  of the habbo's user gets its worth and the credit history the line `Furni exchanged (<item>)` under the new reason
  `exchange`. The room gets 94 and the habbo its balance, 6.
- The worth is the number in the sprite after `CF_` or `CFC_`, as Holo read it; a furni with none, a furni in a hand and
  a habbo that does not own the room change nothing.
- The teleport and trade handlers read their ids with the `rawID` the furni handlers already had.
- In `packages/store`, `go vet ./...`, `go test ./...` and `make check-docs` pass. In `packages/server`,
  `go test ./... -race` passes, with `TestRedeemingCreditFurni`. `make gates` passes.

# Notes

- Runs on the branch `s5-credit-furni`.
- Settled before it started: only the room's owner redeems, a furni that stands in the room, worth the number in its
  name ([0115](/decisions/0115-the-rooms-owner-redeems-credit-furni.md)).
- Chosen without asking: the credit history's line is `Furni exchanged (<item>)`, with the name the catalogue sells the
  furni under, and its reason is `exchange`.
