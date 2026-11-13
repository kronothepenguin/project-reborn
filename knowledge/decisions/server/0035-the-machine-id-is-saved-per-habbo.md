---
type: Decision
title: The machine id is saved with the habbo at each login
description: The machine id the client sends with UNIQUEID before it logs in is kept with the session and saved with the habbo once the login names it, at each login, ready for machine bans.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, data]
---

# Decision

- The machine id the client sends with `UNIQUEID` (813), before it logs in, is kept with the session, and saved with
  the habbo once the login names it, at each login.
- It is kept for machine bans, which a later phase brings.

# Context

Offered keeping it with the session only or saving it, the user chose "Saved per habbo": "Saved with the habbo at
each login, ready for machine bans."

# Consequences

- [s2-03](/tasks/s2-03-saved-login-data.md) adds where it is saved, and [s2-05](/tasks/s2-05-login-in-game.md) and
  [s2-06](/tasks/s2-06-handshake-and-login.md) save it.
