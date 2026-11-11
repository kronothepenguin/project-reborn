---
type: Task
title: Turn credit furni into credits
description: CONVERT_FURNI_TO_CREDITS destroys a coin, a sack or a gold bar that stands in the habbo's room and adds its worth to the user's wallet.
status: todo
phase: s5
depends_on: [s5-08]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_furni_classes/24_Credit Redeem Confirmation Class.ls", "packages/client-r26/src/game/hh_furni_classes/25_Credit Furni Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

The Habbo Exchange's furni turns back into credits ([hh_room](/reference/r26/hh_room.md), `CONVERT_FURNI_TO_CREDITS`).

# Steps

- [ ] `CONVERT_FURNI_TO_CREDITS` (183) destroys the credit furni and adds its worth to the user's wallet, with a line in
  the credit history, in one transaction; the room sees 94 and the habbo its balance as 6.
- [ ] Any other furni is refused.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-credit-furni`.
- To settle before it starts:
  - Where a furni's worth comes from; Holo read it from the sprite's name, 50 from `CF_50_goldbar`.
  - Who redeems; Holo let only the room's owner, for furni that stands in the room.
