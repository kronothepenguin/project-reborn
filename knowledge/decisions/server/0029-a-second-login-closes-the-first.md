---
type: Decision
title: A second login closes the first session
description: When a habbo who is online logs in again, the old session gets 287 with reason 2, which sends its client to the page url_logout_concurrent, and is closed; the new session logs in.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, protocol]
---

# Decision

- When a habbo who is online logs in again, the old session gets 287 with reason 2, on which its client opens the page
  `url_logout_concurrent`, and is closed.
- The new session logs in.

# Context

The client has a handler for each side (hh_entry_init (`packages/server/knowledge/r26/hh_entry_init.md`)): 287 with reason 2 for the old session, and 33 `Duplicate session`,
which shows the login box and `alert_duplicatesession`, for a new one. Offered letting the new login win or refusing it,
the user chose "New login wins (Recommended)": "The old session gets 287 with reason 2 and is closed; the new one logs
in. Example: Frank opens the hotel in a new tab, and the old tab shows the 'logged in elsewhere' page."

# Consequences

- s2-05 makes it a rule of `game`, and s2-06
  writes 287 for it.
