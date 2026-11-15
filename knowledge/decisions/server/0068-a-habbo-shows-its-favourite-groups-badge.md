---
type: Decision
title: A habbo shows its favourite group's badge in rooms
description: In a room a habbo shows the badge of its favourite group from the site, or none, and 309 lists the badges of the groups shown.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, rooms, groups]
---

# Decision

- In a room, a habbo shows the badge of its favourite group, `group_members.favourite` on the site, or none when it has
  no favourite.
- 309, the answer to `GET_GROUP_BADGES`, lists the badges of the groups the room's habbos show.

# Context

Offered the favourite group or none, the user chose "The favourite group (Recommended)": "Its favourite group's badge,
or none when it has no favourite; the room's 309 answer lists the badges of the groups shown."

# Consequences

- s4-07 applies it.
