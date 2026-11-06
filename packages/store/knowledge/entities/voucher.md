---
type: Entity
title: Voucher
description: A code worth credits that staff create in housekeeping and a habbo redeems once into the user's purse, kept as redeemed for audit.
tags: [store, entity, economy]
timestamp: 2026-11-06T22:56:10+00:00
---

# Definition

A voucher is a code worth a number of credits. Staff create it in housekeeping, and a habbo enters it in the purse
of the credits page, which adds its credits to the user's shared [wallet](/entities/wallet.md). Vouchers give credits
only; Holo's item vouchers are gone.

# Invariants

- The code is unique ignoring case, and redeeming and deleting match it ignoring case.
- A voucher is worth more than 0 credits.
- A voucher is redeemed at most once: one statement claims an unused code and returns its credits, so of two
  redemptions of one code only the first finds it unused.
- Redeeming claims the voucher, adds its credits to the wallet and writes a `voucher` ledger row in one transaction.

# Lifecycle

- Created by staff with `housekeeping.vouchers`, with the staff user and the time.
- Listed in housekeeping while unused, in the order they were made, as Holo's housekeeping listed them.
- Redeemed once by a habbo: `redeemed_by_avatar_id` and `redeemed_at` are set, and the row stays for audit where Holo
  deleted it.
- Deleted by staff only while unused; a redeemed voucher is never deleted (0063).
- Deleting the staff user or the habbo keeps the voucher and clears that reference.

# Vocabularies

None.

# Relations

- Created by a staff [user](/entities/user.md); redeemed by a [habbo](/entities/habbo.md) into the user's
  [wallet](/entities/wallet.md).

# Tables

- [vouchers](/tables/vouchers.md)

# Queries

- [economy.query.sql](/queries/economy.md)
