---
type: Entity
title: Voucher
description: A code worth credits that staff create in housekeeping and a habbo redeems once into the user's purse, kept as redeemed for audit.
tags: [store, entity, economy]
timestamp: 2026-11-06T22:56:10+00:00
---

# Definition

A voucher is a code worth a number of credits or one furni. Staff create it in housekeeping, and a habbo enters it in
the purse of the credits page, which adds its credits to the user's shared [wallet](/entities/wallet.md), or puts its
[furni](/entities/furni.md) in the hand of that habbo.

# Invariants

- The code is unique ignoring case, and redeeming and deleting match it ignoring case.
- A voucher is worth more than 0 credits, or one [furni definition](/entities/furni-definition.md), never both: an
  item voucher has 0 credits (`plans/server/decisions/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md`).
- A voucher is redeemed at most once: one statement claims an unused code and returns its credits, so of two
  redemptions of one code only the first finds it unused.
- Redeeming claims the voucher, adds its credits to the wallet and writes a `voucher` ledger row in one transaction.
  An item voucher creates its furni there, as a purchase gives it, and its ledger row holds 0 credits
  (`plans/server/decisions/0121-an-item-voucher-leaves-a-line-of-no-credits.md`,
  `plans/server/decisions/0125-an-item-voucher-gives-what-buying-gives.md`).

# Lifecycle

- Created by staff with `housekeeping.vouchers`, with the staff user and the time. An item voucher is made by a
  sprite, and gets the first furni definition of it.
- Listed in housekeeping while unused, in the order they were made, as Holo's housekeeping listed them.
- Redeemed once by a habbo: `redeemed_by_avatar_id` and `redeemed_at` are set, and the row stays for audit where Holo
  deleted it.
- Deleted by staff only while unused; a redeemed voucher is never deleted (0063).
- Deleting the staff user or the habbo keeps the voucher and clears that reference.

# Vocabularies

None.

# Relations

- Created by a staff [user](/entities/user.md); redeemed by a [habbo](/entities/habbo.md) into the user's
  [wallet](/entities/wallet.md) or the habbo's hand.
- An item voucher gives a [furni definition](/entities/furni-definition.md).

# Tables

- [vouchers](/tables/vouchers.md)

# Queries

- [economy.query.sql](/queries/economy.md)
