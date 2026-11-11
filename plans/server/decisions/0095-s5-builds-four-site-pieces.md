---
type: Decision
title: S5 builds item vouchers, the shared inventory page, Recycler Options and the dashboard counts
description: With furni in the store, S5 ports HoloCMS's item vouchers, its Recycler Options page and its dashboard counts of rooms and furni, and builds the shared inventory page of holo-port 0057.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, cms, housekeeping]
---

# Decision

S5 builds four pieces of the site, now that the store keeps furni:

| Piece | What it is |
| --- | --- |
| Item vouchers | HoloCMS's vouchers of the type Item: staff make a code for a furni by its sprite name, and redeeming it on the credits page puts that furni in the habbo's hand |
| Shared inventory page | The page of `plans/holo-port/decisions/0057-furni-and-rooms.md`: the furni of a user that no habbo holds, with a Take button for the active habbo |
| Recycler Options | HoloCMS housekeeping's page: recycler enabled, minimum owned time, session length and expire length |
| Dashboard counts | How many rooms and furni the hotel has, on housekeeping's dashboard, as HoloCMS showed them |

# Context

The R26 client registers no voucher command, so a voucher is redeemed only on the site, and the site and the game meet
through the database. `plans/holo-port/decisions/0013-defer-game-server-features.md` left these pieces out until the
game server kept furni. Asked which of the four S5 should build, the others going to `plans/later.md`, the user chose
all four: "Item vouchers (Recommended), Shared inventory page (Recommended), Recycler Options page (Recommended),
Dashboard counts".

# Consequences

- [s5-17](/tasks/s5-17-recycler-options-page.md) ports Recycler Options, [s5-18](/tasks/s5-18-item-vouchers.md) item
  vouchers and [s5-20](/tasks/s5-20-dashboard-counts.md) the dashboard's counts;
  [s5-19](/tasks/s5-19-shared-inventory-page.md) builds the shared inventory page.
- The shared inventory page is new, so where it goes and how it looks are asked before it is built.
