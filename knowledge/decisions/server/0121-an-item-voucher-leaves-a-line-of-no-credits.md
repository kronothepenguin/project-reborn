---
type: Decision
title: An item voucher leaves a line of 0 credits in the credit history
description: Redeeming an item voucher writes Item voucher redeem, with the furni's name, in the user's credit history with 0 credits, so that the user and staff see when it was used and what it gave.
status: accepted
timestamp: 2026-11-12T15:30:25+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:30:25+00:00"}
tags: [site, vouchers, credits]
---

# Decision

- Redeeming an item voucher writes a line in the credit history of the user: `Item voucher redeem (<furni name>)`, with
  0 credits.

# Context

HoloCMS wrote `Item voucher redeem` in the account's transactions, with the sprite name where the credits go. The credit
history counts credits, and an item voucher moves none. Offered a line of 0 credits or no line, the user chose "A line
of 0 credits (Recommended)": "The history gets 'Item voucher redeem (<furni name>)' with 0 credits, so the user and
staff still see when a voucher was used and what it gave. Example: '12 Nov, Item voucher redeem (Throne), 0'."

# Consequences

- [s5-18](/tasks/s5-18-item-vouchers.md) writes it, under the reason `voucher`.
