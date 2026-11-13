---
type: Decision
title: A furni on offer in a trade is locked
description: A furni on offer stays in its habbo's hand until the trade ends: it is not placed, used up, given or recycled, so the other side gets exactly what the window showed.
status: accepted
timestamp: 2026-11-11T18:33:33+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:33:33+00:00"}
tags: [server, furni, trading]
---

# Decision

- A furni on offer in an open trade stays in its habbo's hand until the trade ends. It cannot be placed, used up on the
  room or recycled.
- The other side gets exactly what the window showed.

# Context

Holo did not stop a habbo from placing a furni it had on offer, and then moved the furni to the other habbo anyway, even
out of the room. The client hides a furni on offer from the hand. Offered a lock, a furni that leaves the offer when it
is used, or a check at the end, the user chose "Locked while on offer (Recommended)": "A furni on offer stays in the
hand until the trade ends: it cannot be placed, used up or recycled. The client already hides it from the hand. Example:
you offer a throne, and placing it does nothing until you close the trade. The other side gets exactly what the window
showed."

# Consequences

- [s5-14](/tasks/s5-14-trading.md) refuses those uses while a trade holds the furni, and the recycler,
  [s5-16](/tasks/s5-16-recycler.md), does too.
- The trade still checks each furni's hand when it completes, in its one transaction
  ([0092](/decisions/0092-a-trade-lives-only-in-memory.md)).
