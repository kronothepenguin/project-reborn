---
type: Decision
title: Club members come first in a queue
description: A room's queue holds two lines, club members, then everyone else, and a place goes to the club line first.
status: accepted
timestamp: 2026-11-10T20:58:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:58:46+00:00"}
tags: [server, rooms, queue, club]
---

# Decision

- A room's queue holds two lines: club members, then everyone else. A place goes to the club line first, and each line
  keeps its arrival order.

# Context

Offered first come first in, or club members first, the user chose "Club members first": "Two lines: club members,
then everyone else; a place goes to the club line first. Example: a club member who joins late still enters before
non-members already waiting."

# Consequences

- s4-12 applies it to the room's queue and the spectators'.
