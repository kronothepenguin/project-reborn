---
type: Decision
title: An item voucher gives what buying the furni gives
description: A voucher for a teleport gives the linked pair and one for post-its a pad of 20, through one piece of code in packages/virtual/furni that the catalogue and the site both call; vouchers for wallpaper, floor and landscape are refused when made.
status: accepted
timestamp: 2026-11-12T15:37:22+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:37:22+00:00"}
tags: [site, server, vouchers, furni]
---

# Decision

- An item voucher gives what a purchase of the furni gives: a teleport as a pair whose two name each other, a pad of
  post-its with its 20 notes, and any other furni as one piece.
- A voucher for a wallpaper, a floor or a landscape is refused when it is made, since nobody chooses its pattern.
- The code that creates the pieces of a furni is in `packages/virtual/furni`, where the game server's catalogue and the
  site both call it.

# Context

HoloCMS's voucher created one bare piece, so a teleport from a voucher led nowhere and a pad had no notes. The code that
gives a purchase its pieces was inside the game server's buying. Offered what buying gives, a refusal of those furni, or
a bare piece as Holo, the user chose "What buying it gives (Recommended)": "A voucher for a teleport gives the linked
pair, and one for post-its a pad of 20, exactly as the catalogue does. Vouchers for wallpaper, floor and landscape are
refused when made, since nobody picks their pattern. To do it, the small piece of code that creates 'the pieces of a
furni' moves into packages/virtual/furni, where both the game server's catalogue and the site call it; today it lives
inside the game server's buying code."

# Consequences

- [s5-18](/tasks/s5-18-item-vouchers.md) moves the code: `furni.Create`, with `furni.IsTeleport`, `furni.IsPostIt` and
  `furni.IsDecoration`, which the game's rules use too.
- `packages/virtual/furni` holds the definitions in memory for the game server
  ([0098](/decisions/0098-virtual-furni-and-catalogue.md)); `Create` reads none of them, and writes through the caller's
  transaction.
