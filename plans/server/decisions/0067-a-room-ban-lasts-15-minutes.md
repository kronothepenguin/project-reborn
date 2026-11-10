---
type: Decision
title: A room ban lasts 15 minutes
description: An owner's ban keeps the habbo out of that room for 15 minutes, a setting, as Holo's did.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, rooms, moderation]
---

# Decision

- A room ban (`BANUSER`, and the kick and ban of the habbo's window) keeps the habbo out of that room for 15 minutes,
  a setting; then it may enter again. Bans are saved ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Context

The client's ban carries no duration; Holo's lasted 15 minutes (`rooms_roomban_duration`). Offered 15 minutes, an hour,
or until a restart, the user chose "15 minutes (Recommended)": "As Holo, a setting: the banned habbo is refused that
room for 15 minutes, then may enter again."

# Consequences

- [s4-01](/tasks/s4-01-room-tables.md) adds the table and the setting, and [s4-06](/tasks/s4-06-rights-kicks-and-bans.md)
  applies it.
