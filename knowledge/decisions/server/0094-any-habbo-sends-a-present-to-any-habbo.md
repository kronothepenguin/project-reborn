---
type: Decision
title: Any habbo sends a present to any habbo
description: Any catalogue furni can be bought as a present for any habbo by name, online or not; it waits in a box in the receiver's hand with its note, an unknown name charges nothing, and the buyer's credit history names the furni and the receiver.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, catalogue, presents]
---

# Decision

- Any habbo buys any catalogue furni as a present for any habbo, named in the order window, online or not, at the normal
  price.
- The present waits in the receiver's hand in one of Holo's six boxes, with the buyer's note. The receiver places the
  box in a room and opens it, and the furni goes to its hand.
- A name that no habbo has gets 76 and charges nothing.
- Saved: the box, what is inside and the note. The line that the purchase writes in the buyer's credit history,
  `wallet_transactions`, names the furni and the receiver.

# Context

Holo saved the box, what was inside and the note, and nothing about who sent it. Offered anyone to anyone, only to
friends, which would wait for S6, or no presents, the user chose "Anyone to anyone, as Holo (Recommended)": "Any habbo
gifts any catalogue furni to any habbo by name, online or not, at the normal price. It arrives in the receiver's hand in
one of six boxes; placing the box in a room and opening it gives the furni. An unknown name charges nothing. Saved: the
box, what is inside and the note; the buyer's credit history names the furni and the receiver."

# Consequences

- [s5-06](/tasks/s5-06-presents.md) builds presents.
