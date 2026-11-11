---
type: Task
title: Buy furni
description: GPRC buys a catalogue item with the user's credits in one transaction, and the furni lands in the buyer's hand, with deals, trophies and decorations.
status: todo
phase: s5
depends_on: [s5-03, s5-04]
packages: [packages/store, packages/server]
client: ["packages/client-r26/src/game/hh_cat_code/4_Catalogue Component Class.ls", "packages/client-r26/src/game/hh_cat_code/5_Catalogue Handler Class.ls", "packages/client-r26/src/game/hh_cat_code/9_Catalogue spaces Class.ls", "packages/client-r26/src/game/hh_cat_code/11_Catalogue trophies Class.ls"]
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A habbo buys furni with its user's credits ([hh_cat_code](/reference/r26/hh_cat_code.md#buying)).

# Steps

- [ ] `GPRC` (100) buys an item of a page the habbo may see: the user's wallet pays the price, the credit history gets
  its line and the furni lands in the buyer's hand, in one transaction; the client gets 67 and the new balance as 6.
- [ ] 68 when the credits are not enough, 65 for an item the page does not sell, and 296 with 1 when the page sells only
  to club members and the habbo is not one ([0102](/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md));
  none of them charges.
- [ ] A deal gives every furni of it. A trophy keeps the buyer's name, the day and the inscription; a wallpaper, a floor
  and a landscape keep the pattern the buyer chose.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-buying-furni`.
- To settle before it starts:
  - What the purchase's line in the credit history says.
  - How many notes a pad of post-its has; Holo's had 20.
