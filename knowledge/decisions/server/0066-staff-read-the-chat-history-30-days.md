---
type: Decision
title: Staff read the chat history in housekeeping, and it is kept 30 days
description: A housekeeping page behind a new attribute searches the saved chat by room or habbo, as HoloCMS's did, and lines older than 30 days, a setting, are deleted.
status: accepted
timestamp: 2026-11-10T16:41:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T16:41:02+00:00"}
tags: [server, chat, housekeeping]
---

# Decision

- What habbos say in rooms is saved ([0011](/decisions/server/0011-saved-and-memory-only-data.md)); a housekeeping page behind
  a new attribute searches it by room or by habbo, as HoloCMS's chat logs page did.
- Lines older than 30 days, a setting, are deleted.

# Context

Holo kept every line forever, and HoloCMS's housekeeping had a chat logs page, which
`knowledge/decisions/holo-port/0013-defer-game-server-features.md` deferred to the game server. Offered 30 days, forever,
or 90 days, the user chose "Staff, 30 days (Recommended)": "A housekeeping page behind a new attribute searches it by
room or habbo, as HoloCMS's did; lines older than 30 days (a setting) are deleted."

# Consequences

- s4-01 adds the table, the attribute and the setting, s4-05
  saves the chat, and s4-08 brings the page and the deletion.
