---
type: SQL Update
title: 0021-item-vouchers.sql
description: Rebuilds vouchers so that a voucher gives credits or one furni.
resource: packages/store/migrations/0021-item-vouchers.sql
tags: [store, update, economy]
timestamp: 2026-11-12T15:30:25+00:00
---

# Update

| | |
|---|---|
| Title | A voucher gives credits or one furni. |
| Automatic | no |

Rebuilds [vouchers](/tables/vouchers.md), which gains `furni_definition_id`, takes 0 credits for an item voucher, and
checks that a voucher gives credits or a furni, never both and never neither: a new table with every row copied, the old
one dropped and the new one renamed. Every voucher there is gives credits, and keeps them
(`plans/server/decisions/0120-an-item-voucher-gives-the-first-furni-of-its-sprite.md`).
