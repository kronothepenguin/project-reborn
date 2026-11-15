---
type: Decision
title: An item voucher gives the first furni of its sprite
description: An item voucher made by a sprite name gives the furni of that sprite with the lowest id, as HoloCMS took the first, and a name that matches no furni is refused when the voucher is made.
status: accepted
timestamp: 2026-11-12T15:30:25+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:30:25+00:00"}
tags: [site, housekeeping, vouchers, furni]
---

# Decision

- Housekeeping makes an item voucher by a furni's sprite name. When several furni share the sprite, the voucher gives
  the one with the lowest id: the white bed for `bed_budgetb`.
- A name that matches no furni is refused when the voucher is made, with a message, so that no habbo redeems a voucher
  that gives nothing.

# Context

HoloCMS kept the name typed and looked it up when the voucher was redeemed, taking the first row. Some sprites name
several furni: `bed_budgetb` is five beds of different colours. Offered the first, a name or a furni's id, or a refusal
of such names, the user chose "The first, as Holo (Recommended)": "The furni with that sprite and the lowest id; for
'bed_budgetb' the white bed. A name that matches no furni is refused when the voucher is made, with a message, so that
no habbo ever redeems a voucher that gives nothing. Example: staff type 'throne' and the voucher gives a Throne."

# Consequences

- s5-18 stores the furni definition with the voucher.
