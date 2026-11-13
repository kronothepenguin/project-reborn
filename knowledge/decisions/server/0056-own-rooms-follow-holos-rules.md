---
type: Decision
title: A habbo's own rooms follow Holo's rules
description: Up to 50 rooms per habbo, names of 1 to 50 characters without a filter, the client's three doors, passwords of 1 to 32 characters, and 10 to 25 visitors, 25 by default.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, navigator, rooms]
---

# Decision

- A habbo owns up to 50 rooms, a setting; the 51st gets 33 `Error creating a private room`.
- A room's name has 1 to 50 characters, and no word filter checks it: the site has none.
- The door is one of the client's three: open, closed, which rings the bell, or password. A password has 1 to 32
  characters.
- A room takes 10 to 25 visitors, 25 by default.

# Context

Offered Holo's rules, or the same with a list of banned words that housekeeping edits, the user chose "Holo's rules
(Recommended)": "Up to 50 rooms per habbo (a setting); names of 1 to 50 characters, unfiltered; the client's three
doors; passwords of 1 to 32 characters; 10 to 25 visitors, 25 by default. Example: a 51st room gets 33 "Error creating
a private room"."

# Consequences

- s3-06 and s3-07 apply them.
