---
type: Decision
title: The hand is read from the database each time
description: Opening the hand, placing, buying, trading and recycling read and write the store at that moment, like the wallet; the server keeps no copy of a hand, so what the site or another habbo gives shows the next time the hand opens.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, furni, data]
---

# Decision

- The server keeps no copy of a habbo's hand. Opening the hand, placing, picking up, buying, trading and recycling read
  and write the store at that moment.
- So what another habbo or the site gives, a present, an item voucher or the shared inventory's Take, shows the next
  time the hand opens.

# Context

[0009](/decisions/server/0009-virtual-holds-the-server-state.md) loads a habbo's own data at login, and
[0053](/decisions/server/0053-the-online-habbo-holds-its-own-data.md) reads the wallet and the club from the store when the
client asks, because the user's habbos share them. Offered the database each time or a copy in memory loaded at login,
the user chose "The database, each time (Recommended)": "Opening the hand, placing, buying and trading read and write
the database at that moment, like the wallet and like Holo. One source of truth: a present bought for an online habbo,
an item voucher or the site's Take show up the next time the hand opens. Example: Ana redeems a Throne voucher on the
site, opens her hand in the client and the Throne is there. Costs one small query per hand page."

# Consequences

- s5-04 builds the hand.
- A room's placed furni stays hot data of the loaded room ([0009](/decisions/server/0009-virtual-holds-the-server-state.md)).
