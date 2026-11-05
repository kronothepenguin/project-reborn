---
type: Decision
title: A change to hot data reaches the database at once
description: When saved data changes in the game, the handler writes the row and then updates memory, so a crash or a restart loses nothing, and temporary data never touches the database.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, virtual, data]
---

# Decision

- When saved data changes in the game, a furni moved for example, the handler writes the row and then updates the copy
  in memory. A crash or a restart loses nothing.
- Temporary data, such as positions, never touches the database.

# Context

Offered writing at once, in batches every few seconds, or when the room unloads, the user chose writing at once.
