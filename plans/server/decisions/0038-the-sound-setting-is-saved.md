---
type: Decision
title: A habbo's sound setting is saved
description: The sound setting the client reads at login and changes with the room bar is saved with the habbo.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, data]
---

# Decision

- The sound setting, which the client asks for with `GET_SOUND_SETTING` (228) and changes with `SET_SOUND_SETTING`
  (229), is saved with the habbo, so it is the same at the next login.

# Context

[0011](/decisions/0011-saved-and-memory-only-data.md) asks each phase about its data. Offered saving it per habbo or
keeping it in memory, the user chose "Saved per habbo (Recommended)": "Saved with the habbo, so the choice is still
there at the next login. Example: Frank turns sound off, logs out, and it is still off tomorrow."

# Consequences

- [s2-03](/tasks/s2-03-saved-login-data.md) adds the column, and [s2-07](/tasks/s2-07-after-login.md) reads and
  writes it.
