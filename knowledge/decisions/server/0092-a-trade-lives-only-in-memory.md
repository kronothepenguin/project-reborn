---
type: Decision
title: A trade lives only in memory
description: An open trade is temporary data; furni stays in its owner's hand until both habbos accept, then changes hands in the database in one transaction, and a restart, a disconnect or leaving the room closes the trade.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, trading, data]
---

# Decision

- An open trade is temporary data ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)): it lives in memory, in
  the loaded room ([0098](/decisions/server/0098-virtual-furni-and-catalogue.md)).
- Furni offered stays in its owner's hand until both habbos accept. Then every piece changes hands in the database in
  one transaction.
- A restart, a disconnect or either habbo leaving the room closes the trade, and nobody loses anything.
- Finished trades are not recorded.

# Context

Holo kept a trade in memory and wrote the new owners when both sides had accepted. Offered memory only, memory plus a
saved record of finished trades for staff, or the trade in progress saved too, the user chose "Memory only, as Holo
(Recommended)": "The open trade lives in memory. Furni stay in their owner's hand until both accept, then swap in the
database in one step. A restart, a disconnect or leaving the room closes the trade and nobody loses anything. Example:
Ana offers a Throne and the server restarts: Ana still has her Throne."

# Consequences

- s5-14 builds trading.
