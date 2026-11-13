---
type: Decision
title: The server pings every 30 seconds and closes a session after 90 seconds without PONG
description: Two settings: the server sends PING every 30 seconds, and closes a session that has sent no PONG for 90 seconds, which logs its habbo out.
status: accepted
timestamp: 2026-11-09T22:20:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:20:00+00:00"}
tags: [server, protocol, settings]
---

# Decision

- A setting holds how often the server sends `PING` (50): every 30 seconds by default.
- A setting holds how long the server waits for `PONG` (196): a session without one for 90 seconds, by default, is closed
  and its habbo logged out.

# Context

The client answers each `PING` at once and expects none at any rate (hh_entry_init (`packages/server/knowledge/r26/hh_entry_init.md`)). Offered 30 seconds with a close after 90,
or 60 seconds with a close after 3 minutes, the user chose "30 s, close after 90 s (Recommended)": "Two settings: a PING
every 30 seconds, and a session closed after 90 seconds without a PONG, which logs the habbo out."

# Consequences

- s2-08 declares the settings and pings.
