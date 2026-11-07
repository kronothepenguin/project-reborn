---
type: Phase
title: P6 Economy
description: Credits page with purse and vouchers, transaction history, Habbo Club subscriptions and the club wardrobe, with voucher management in housekeeping.
status: active
timestamp: 2026-11-07T00:32:36+00:00
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
  credits with a ledger row, and gives the club badge `HC1` to every habbo of the user that lacks it, the buyer
  wearing it; `HC1` leaves them when the club ends ([0103](/decisions/0103-club-badge-for-every-habbo.md)).
- Settings: `club.*`, `creditsPage.*` and `homes.wardrobeSlots`. The credits page boxes are BBCode with their pictures
  in the page ([0105](/decisions/0105-credits-boxes-in-bbcode.md)).
- The account transactions page shows the habbo of each row ([0104](/decisions/0104-transactions-show-the-habbo.md)).
- The wallet and the club belong to the user ([0056](/decisions/0056-wallet-club-and-inventory-per-user.md)).
- Staff can delete an unused voucher, with `POST /housekeeping/vouchers/{code}/delete`
  ([0063](/decisions/0063-what-housekeeping-can-delete.md)).

# Exit criteria

- Voucher redemption marks the voucher redeemed and credits the wallet in one transaction.
- Club status, days left and the club perks (skins, wardrobe, wider playground) follow `club_subscriptions`.

# Tasks

1. [p6-01 Declare the economy settings](/tasks/p6-01-economy-settings.md) — done
2. [p6-02 Store vouchers, club purchases and wardrobe outfits](/tasks/p6-02-store-economy.md) — done
3. [p6-03 Show the credits page and redeem vouchers](/tasks/p6-03-credits-page.md) — done
4. [p6-04 Show the account transactions](/tasks/p6-04-account-transactions.md) — done
5. [p6-05 Buy club on the club page](/tasks/p6-05-club-page.md)
6. [p6-06 Keep outfits in the club wardrobe](/tasks/p6-06-club-wardrobe.md)
7. [p6-07 Manage vouchers in housekeeping](/tasks/p6-07-housekeeping-vouchers.md) — done
8. [p6-08 Verify P6](/tasks/p6-08-exit-check.md)
9. [p6-09 Count the club days to the end of the last period](/tasks/p6-09-club-days-to-the-last-period.md)
10. [p6-10 Keep every voucher deletable](/tasks/p6-10-keep-every-voucher-deletable.md) — blocked

# Open questions

Found by [p6-07](/tasks/p6-07-housekeeping-vouchers.md) on 2026-11-07. The first option is the recommendation.

1. **Vouchers that cannot be deleted.** A code takes any 20 characters, as Holo's did, but a browser reads the codes
   `.` and `..` in `/housekeeping/vouchers/{code}/delete` as folders, so their `Delete` answers 404 and the voucher
   stays ([p6-10](/tasks/p6-10-keep-every-voucher-deletable.md)).
   - `Create Voucher` refuses those two codes alone, with a message such as `The redemption code cannot be . or ..`.
   - Codes take only letters and digits, as badge codes do.
   - Nothing changes: those two vouchers can be created and redeemed, but never deleted.
