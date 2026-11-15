---
type: Decision
title: Items on a group home go back to the members who placed them
description: An item removed from a group home, and every item of a deleted group's home, goes back to the inventory of the user whose habbo placed it.
status: accepted
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [groups, homes, p5]
---

# Decision

- An item removed from a group home goes back to the user whose habbo placed it, as Holo's edit menu promises: "This
  item belongs to another user. If you remove it, it will return to their inventory."
- Deleting a group returns every item on its home to the users whose habbos placed them, as archiving a habbo does
  ([0089](/decisions/holo-port/0089-archived-habbos-show-as-archived.md)).

# Context

Holo gave a removed item to the admin who removed it, and destroyed every item when the owner deleted the group. Asked
about stickers that members placed, the user chose to give both back to their members.

# Consequences

- The owner's warning stays as Holo's: "You will lose everything currently on your group home!" The home's layout is
  lost, though its items return.
