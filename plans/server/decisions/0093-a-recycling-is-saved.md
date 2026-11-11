---
type: Decision
title: A recycling is saved
description: The furni a habbo gives the recycler leave its hand and wait in the database with the time the recycling started, so a restart changes nothing; the habbo takes the reward, which destroys them, or cancels and gets them back.
status: accepted
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
tags: [server, recycler, data]
---

# Decision

- A recycling is saved: the furni a habbo gives the recycler leave its hand and wait in the database, with the time the
  recycling started and the reward it brings.
- When the recycling is over, the habbo takes the reward, and the furni given are destroyed; or it cancels, and gets
  them back.
- A restart changes nothing: the time left counts from the saved start.

# Context

Holo saved a recycling as a row of `users_recycler` and kept the furni given in a room numbered -2. Offered saved or
memory only, the user chose "Saved, as Holo (Recommended)": "The furni given leave the hand and wait in the database
with the start time. After 60 minutes the habbo takes the reward and the furni given are destroyed, or cancels and gets
them back. A restart changes nothing. Example: Ana gives 20 chairs at 10:00, the server restarts at 10:30, and her Palm
Chair is ready at 11:00."

# Consequences

- [s5-16](/tasks/s5-16-recycler.md) builds the recycler, with Holo's rewards and times as its first values.
- A recycling joins what [0011](/decisions/0011-saved-and-memory-only-data.md) saves.
