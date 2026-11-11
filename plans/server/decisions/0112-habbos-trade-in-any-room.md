---
type: Decision
title: Habbos trade in any room
description: The server opens a trade in any room, as Holo did, and leaves a category's trading switch to the client, which hides its Trade button where it is off.
status: accepted
timestamp: 2026-11-11T18:33:33+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T18:33:33+00:00"}
tags: [server, furni, trading, rooms]
---

# Decision

- The server opens a trade in any room. It never looks at the trading switch of the room's category, which the client
  reads to show or hide its Trade button.

# Context

Each room category has a trading switch, which the navigator sends to the client. Holo's server checked only one global
switch. Offered a server that refuses a trade where the category has trading off, or Holo's way, the user chose
"Anywhere, as Holo": "The server never looks at the category; only the client hides the button. A modified client could
open a trade in any room." The recommendation was the category's switch.

# Consequences

- [s5-14](/tasks/s5-14-trading.md) checks no category.
