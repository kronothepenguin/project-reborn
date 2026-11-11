---
type: Decision
title: A room holds up to 500 furni
description: A habbo room takes at most game.maxRoomFurni furni, 500 by default, a setting of the Game form; one more is refused and stays in the hand.
status: accepted
timestamp: 2026-11-11T17:04:48+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T17:04:48+00:00"}
tags: [server, furni, settings]
---

# Decision

- A habbo room holds at most `game.maxRoomFurni` furni, floor furni and wall items together, 500 by default.
- One more is refused and stays in the placer's hand.
- The setting is in housekeeping's Game form, like the limits on rooms and favourites.

# Context

Holo had no limit. Offered no limit as Holo, or a setting of 500, the user chose "A setting, 500 by default": "A game
setting in housekeeping's Game form, game.maxRoomFurni, like the limits on rooms and favourites. Example: the 501st
furni is refused and stays in the hand."

# Consequences

- [s5-08](/tasks/s5-08-placing-furni.md) declares the setting and applies it.
