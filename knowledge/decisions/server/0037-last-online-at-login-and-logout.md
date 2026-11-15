---
type: Decision
title: The last time online is written at login and at logout
description: A habbo's last time online, saved by decision 0011, is written when the habbo logs in and when they log out.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, data]
---

# Decision

- A habbo's last time online, which [0011](/decisions/server/0011-saved-and-memory-only-data.md) saves, is written when the
  habbo logs in and when they log out.

# Context

Offered writing it at login and logout, at logout only or at login only, the user chose "Login and logout
(Recommended)": "Written at both, so it stays right even when the server stops without a clean logout: the login time is
then the last one known."

# Consequences

- s2-03 adds the column, and s2-05 writes it.
