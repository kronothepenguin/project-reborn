---
type: Decision
title: A side of a trade offers up to a setting, 65 by default
description: The setting game.maxTradeFurni, 65 by default as Holo's limit, is the most furni one side of a trade puts on offer.
status: accepted
timestamp: 2026-11-11T18:33:33+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:33:33+00:00"}
tags: [server, furni, trading, settings]
---

# Decision

- The setting `game.maxTradeFurni`, 65 by default, is the most furni one side of a trade offers. Housekeeping's Game
  form changes it.
- A furni past the limit is not added.

# Context

Holo kept 65 furni a side. The client's window shows six slots a side, and identical furni share a slot with a counter.
Offered a setting or the fixed number, the user chose "A setting, 65 by default (Recommended)": "A game setting in
housekeeping, Holo's 65 to start. Example: with the setting at 65, the 66th furni a habbo drags in is not added."

# Consequences

- s5-14 adds the setting and reads it.
