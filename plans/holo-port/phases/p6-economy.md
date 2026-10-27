---
type: Phase
title: P6 Economy
description: Credits page with purse and vouchers, transaction history, Habbo Club subscriptions and the club wardrobe, with voucher management in housekeeping.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p6, cms, housekeeping]
---

# Goal

Habbos see their credits and transactions, redeem vouchers, buy club months and use the wardrobe while in the club.

# Scope

| Holo source | Routes | Astro pages | Composed UI (⚡ = island) |
| --- | --- | --- | --- |
| `credits.php`, `redeemvoucher.php`, `transactions.php` | `GET /credits`, `POST /credits/vouchers`, `GET /credits/transactions` | `credits.astro`, `credits/transactions.astro` | ⚡`credits/purse`, `credits/transactions-table`, `creditsPage.*` boxes |
| `club.php`, `club_confirm.php`, `club_subscribe.php`, `ajax_club.php` | `GET /club`, `POST /club/subscriptions` | `club.astro` | ⚡`club/membership` (status, buy, confirm dialog, `club.*`) |
| `wardrobestore.php` | `POST /account/looks/wardrobe/{slot}` | — | ⚡`account/wardrobe` (club habbos only, `homes.wardrobeSlots`) |
| housekeeping `vouchers.php` | `/housekeeping/vouchers` (GET/POST) | — | `housekeeping.vouchers`; credit vouchers only |

- A club purchase adds a `club_subscriptions` period starting at the later of now and the current end, debits
  credits with a ledger row, and grants the club badge on the first purchase.
- Settings: `club.*`, `creditsPage.*`.

# Exit criteria

- Voucher redemption marks the voucher redeemed and credits the wallet in one transaction.
- Club status, days left and the club perks (skins, wardrobe, wider playground) follow `club_subscriptions`.

# Tasks

Created when the phase starts.
