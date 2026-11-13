---
type: Decision
title: An archived habbo's rooms move to the active habbo
description: Archiving a habbo gives every room it owns to the habbo the user plays, furni in place and past the limit of rooms, and sends its hand and what waits in its recycler to the shared inventory.
status: accepted
timestamp: 2026-11-12T15:30:25+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-12T15:30:25+00:00"}
tags: [site, furni, rooms, account]
---

# Decision

- Archiving a habbo gives every room it owns to the active habbo, with its furni left in place. The room's creator stays
  as it was.
- The rooms move even past the rooms a habbo may own.
- The furni in its hand goes to the shared inventory, and so does the furni that waits in its recycler, whose recycling
  ends.

# Context

`plans/holo-port/decisions/0057-furni-and-rooms.md` moves an archived habbo's rooms to the active habbo, which was the
agent's reading of the user's words, and nothing did it yet. A habbo is archived only while the user plays another one.
Offered that, rooms that stay with the archived habbo, or a refusal to archive a habbo that owns rooms, the user chose
"They move to the habbo you play (Recommended)": "Every room the archived habbo owns gets the active habbo as owner,
with its furni left in place; the room's creator stays as it was. They move even past the 50 rooms a habbo may own.
Furni waiting in its recycler also goes to the shared inventory and that recycling ends. Example: you archive 'Old'
while playing 'New'; Old's 3 rooms now show New as owner in the navigator."

# Consequences

- [s5-19](/tasks/s5-19-shared-inventory-page.md) does it in the transaction that archives the habbo.
