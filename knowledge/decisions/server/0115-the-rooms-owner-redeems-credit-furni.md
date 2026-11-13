---
type: Decision
title: The room's owner redeems a credit furni, worth what its name says
description: Only the room's owner turns a coin, a sack or a gold bar that stands in the room into credits, worth the number in the furni's name, as Holo had it.
status: accepted
timestamp: 2026-11-11T18:33:33+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:33:33+00:00"}
tags: [server, furni, credits]
---

# Decision

- Only the room's owner redeems a credit furni, one that stands in the room. Staff holding `fuse_any_room_controller`
  count as the owner, as for picking up.
- The furni is destroyed, and its worth goes to the redeemer's wallet, with a line in the credit history.
- The worth is the number in the furni's name: `CF_50_goldbar` gives 50.

# Context

Holo let only the room's owner redeem, for a furni standing in the room, and read the worth from the sprite's name.
Offered that, or the furni's own user only, the user chose "As Holo (Recommended)": "Only the room's owner (staff
holding fuse_any_room_controller count as owner, as for picking up) redeems a credit furni that stands in the room. The
furni is destroyed and its worth, read from its name, goes to the redeemer's wallet with a line in the credit history.
Example: you place a gold bar in your room, double-click it and get 50 credits."

# Consequences

- [s5-15](/tasks/s5-15-credit-furni.md) builds it.
