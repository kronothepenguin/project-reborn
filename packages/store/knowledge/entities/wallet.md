---
type: Entity
title: Wallet
description: A habbo's credits, tickets and film, the ledger of every credit change, and the vouchers that add credits.
tags: [store, entity, economy]
timestamp: 2026-10-27T21:28:26+00:00
---

# Definition

Credits are per habbo. Every change of credits writes a signed ledger row in the same transaction, so the ledger
explains the balance. Vouchers are codes created by staff that add credits once.

# Invariants

- Balances never go below zero; a debit is `UPDATE … SET credits = credits + ?` guarded by `credits + ? >= 0`
  (`:execrows` tells whether it applied), never a read followed by a write.
- One ledger row per credit change, in the same transaction.
- A voucher is redeemed at most once; its code matches ignoring case.

# Lifecycle

- Created with the habbo, with `registration.startCredits` and a `registration` ledger row.
- Redeemed vouchers keep their row with `redeemed_by_avatar_id` and `redeemed_at`.
- Deleted with the habbo, with its ledger.

# Vocabularies

| Column | Values |
|--------|--------|
| `wallet_transactions.reason` | `registration`, `referral`, `store`, `group`, `club`, `voucher`, `staff` |

# Relations

- Belongs to a [habbo](/entities/habbo.md); pays for the [home store](/entities/home-store.md),
  [groups](/entities/group.md) and [club subscriptions](/entities/club-subscription.md).

# Tables

- [wallets](/tables/wallets.md)
- [wallet_transactions](/tables/wallet_transactions.md)
- [vouchers](/tables/vouchers.md)

# Queries

- [economy.query.sql](/queries/economy.md)
