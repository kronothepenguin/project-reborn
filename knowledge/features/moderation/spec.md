---
type: Spec
title: Moderation
description: "Staff moderate the hotel from the client and from housekeeping: chat commands, the word filter, calls for help, bans and alerts that reach the game at once, and staff tools for groups."
status: planned
projects: [packages/server, packages/virtual, packages/store, packages/housekeeping, packages/cms]
---

# What

Staff keep the hotel in order, from the client and from housekeeping.

It builds on [platform](/features/platform/spec.md).

# Behaviours

Written with the user when the feature is planned.

# Open questions

From the server's phase S7, as written there:

- "Which moderation tools the client offers and which stay in housekeeping."
- "Who receives the calls for help, and where a staff member who follows one is taken: the client checks no right before
  it shows a call (148), and after `FOLLOW_CRYFORHELP` it waits for the server to move it, as 286 does".

And from [later](/features/moderation/later.md): which of Holo's chat commands the hotel keeps, and where the word
filter's words live.
