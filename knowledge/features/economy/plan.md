---
type: Plan
title: "Economy: how"
description: An Economy service tells the game of credits, tickets and film changed by housekeeping and the site.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/store` | The user's wallet and its ledger `wallet_transactions`, and the `vouchers` table |
| `packages/cms` | `/credits` with the purse, `POST /credits/vouchers`, `/credits/transactions`; start credits at registration |
| `packages/auth` | `CreateAccount` writes the start credits and their ledger row |
| `packages/housekeeping` | Give Credits, a habbo's transactions, Voucher Management, the Credits Page settings form |
| `packages/virtual` | The settings `registration.startCredits` and `creditsPage.*`; `furni.Create` gives an item voucher's furni |
| `packages/server` | Reads the purse from the store when the client asks |

Planned:

| Project | Part |
| --- | --- |
| `packages/services` | The `Economy` service: `SendCredits(ctx, userID)`, and tickets and film ([0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)) |
| `packages/housekeeping` | Gives and takes credits, tickets and film; tells the game |
| `packages/cms` | Vouchers, groups and the home store spend or give credits; tells the game |
| `packages/server` | Sends a player its new balance at once |

Today a change of credits on the site shows in the game at the player's next purchase or login. Club is
[its own feature](/features/club/spec.md).

# Decisions

- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) — Changes the game must show at once
  reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory
  implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store
  nothing.
- [Slices follow the hotel's own features, and habbos comes
  first](/decisions/reborn/0010-slices-follow-the-hotels-features.md) — The economy and club are separate slices, furni
  with its catalogue is furnis, friends is the messenger, and habbos, rooms and navigator are slices of their own; the
  habbos slice is the first feature built, end to end from the site to the client.
- [Home backgrounds are unlocks](/decisions/holo-port/0064-backgrounds-are-unlocks.md) — Supersedes 0056 and keeps its
  rest: one wallet per user for all its habbos, and the start credits given once.
- [What housekeeping can delete](/decisions/holo-port/0063-what-housekeeping-can-delete.md) — The credit history and
  the staff log stay as written, and an unused voucher can be deleted.
- [The account transactions page shows the habbo of each
  row](/decisions/holo-port/0104-transactions-show-the-habbo.md) — `/credits/transactions` lists the 50 newest ledger
  rows with a Habbo column.
- [The credits page boxes are BBCode with their pictures in the
  page](/decisions/holo-port/0105-credits-boxes-in-bbcode.md) — The two boxes are BBCode, each picture is part of the
  page, and the list becomes lines starting with `* `.
- [Voucher codes . and .. are refused](/decisions/holo-port/0106-dot-voucher-codes-refused.md) — Create Voucher refuses
  those two codes, so every voucher it makes can be deleted.
- [The online habbo holds its badges, its sound setting and its
  fuses](/decisions/server/0053-the-online-habbo-holds-its-own-data.md) — The wallet and the club are read from the
  store when the client asks.
- [An item voucher gives the first furni of its
  sprite](/decisions/server/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md) — The furni of that sprite
  with the lowest id; a name that matches no furni is refused when the voucher is made.
- [An item voucher leaves a line of 0 credits in the credit
  history](/decisions/server/0121-an-item-voucher-leaves-a-line-of-no-credits.md) — `Item voucher redeem (<furni
  name>)` with 0 credits.
- [An item voucher gives what buying the furni
  gives](/decisions/server/0125-an-item-voucher-gives-what-buying-gives.md) — A teleport pair, a pad of 20 post-its or
  one piece, through `furni.Create` in `packages/virtual/furni`; wallpaper, floor and landscape are refused.
