---
type: Entity
title: Wallet
description: A user's credits, tickets and film, shared by all their habbos, the ledger of every credit change, and the vouchers that add credits.
tags: [store, entity, economy]
timestamp: 2026-11-02T01:44:15+00:00
---

# Definition

Credits belong to the user, so all their habbos share one purse. Every change of credits writes a signed ledger row in
the same transaction, so the ledger explains the balance, and the row names the habbo that acted. Vouchers are codes created by staff that add credits once.

# Invariants

- Balances never go below zero; a debit is `UPDATE … SET credits = credits + ?` guarded by `credits + ? >= 0`
  (`:execrows` tells whether it applied), never a read followed by a write.
- One ledger row per credit change, in the same transaction.
- A voucher is redeemed at most once; its code matches ignoring case.

# Lifecycle

- Created with the user, with `registration.startCredits` and a `registration` ledger row. A habbo added later has no
  wallet of its own, so the start credits are given once.
- The installer creates the administrator's wallet with 5000 credits and a `registration` row whose detail is
  `installer`.
- Redeemed vouchers keep their row with `redeemed_by_avatar_id` and `redeemed_at`.
- Deleted with the user, with its ledger.

# Vocabularies

| Column | Values |
|--------|--------|
| `wallet_transactions.reason` | `registration`, `referral`, `store`, `group`, `club`, `voucher`, `staff` |

# Relations

- Belongs to a [user](/entities/user.md), and shared by their [habbos](/entities/habbo.md); pays for the [home store](/entities/home-store.md),
  [groups](/entities/group.md) and [club subscriptions](/entities/club-subscription.md).

# Tables

- [wallets](/tables/wallets.md)
- [wallet_transactions](/tables/wallet_transactions.md)
- [vouchers](/tables/vouchers.md)

# Queries

- [economy.query.sql](/queries/economy.md)
