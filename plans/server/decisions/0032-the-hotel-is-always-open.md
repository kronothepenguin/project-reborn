---
type: Decision
title: The hotel is always open
description: The server never sends the opening-hours messages 290 to 294, and never refuses a login for the time of day.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, protocol]
---

# Decision

- The server never sends 290 to 294, and never refuses a login for the time of day.
- The client's opening-hours windows stay unused.

# Context

The client can warn online habbos that the hotel closes, show it closed, and turn logins away ([hh_entry_init](/reference/r26/hh_entry_init.md)). Offered an
always-open hotel or a closing schedule, the user chose "Always open (Recommended)": "The server never sends 290 to
294, and logins are never refused for the time of day."

# Consequences

- S2 has no task for opening hours.
