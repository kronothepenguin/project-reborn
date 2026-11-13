---
type: Decision
title: A recycling starts only in a room
description: A habbo starts a recycling only while it is in a room, as Holo asked, where a furni on offer in a trade is refused; taking the reward and cancelling work anywhere.
status: accepted
timestamp: 2026-11-12T01:11:06+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T01:11:06+00:00"}
tags: [server, furni, recycler, rooms]
---

# Decision

- `START_FURNI_RECYCLING` from a habbo that is in no room is refused.
- A furni on offer in a trade is not recycled ([0114](/decisions/server/0114-a-furni-on-offer-is-locked.md)).
- Taking the reward and cancelling work anywhere.

# Context

Holo let a habbo start a recycling only in a room, and the client's hand, where the furni come from, exists only in a
room. Offered that or no check, the user chose "Only in a room, as Holo (Recommended)": "START_FURNI_RECYCLING from a
habbo that is in no room is refused. It also lets the trade lock work: a furni on offer in a trade cannot be recycled.
Taking the reward or cancelling works anywhere."

# Consequences

- s5-16 builds it.
