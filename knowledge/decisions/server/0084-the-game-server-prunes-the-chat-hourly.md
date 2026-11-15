---
type: Decision
title: The game server prunes the chat history hourly
description: The game server, which saves the chat, deletes the lines older than game.chatHistoryDays when it starts and every hour after.
status: accepted
timestamp: 2026-11-10T20:10:23+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:10:23+00:00"}
tags: [server, chat, housekeeping]
---

# Decision

- The game server, which saves the chat history, deletes the lines older than `game.chatHistoryDays`
  ([0066](/decisions/server/0066-staff-read-the-chat-history-30-days.md)) once when it starts and every hour after, once the
  database updates are applied.

# Context

Offered the game server hourly or housekeeping on each search, the user chose "The game server, hourly (Recommended)":
"The server saves the lines, so it also prunes them: once when it starts and then every hour. Example: a line said 30
days and 1 hour ago is gone within the hour, whether or not staff look."

# Consequences

- s4-08 applies it.
