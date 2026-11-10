---
type: Decision
title: A room's rating is the sum of its votes and the share of +1
description: 345 carries -1 until the habbo votes, then the sum of the room's votes, never below 0, with the share of +1 votes as the percent; it goes to everyone in the room who has voted.
status: accepted
timestamp: 2026-11-10T19:40:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
tags: [server, rooms, rating]
---

# Decision

- A room's rating, 345, carries -1 until the habbo votes, which shows the client's vote buttons; then the sum of the
  room's votes, never below 0, as Holo had it, and as its percent the share of +1 votes, 0 to 100.
- A vote sends the new rating to everyone in the room who has voted.

# Context

The client shows vote buttons while the rating is -1 and "rated N" after, and stores a percent it never shows. Offered
the share of +1 votes or 0 as the percent, the user chose "Sum, and share of +1 (Recommended)": "As Holo: -1 until the
habbo votes, then the sum of votes, never below 0, sent to everyone in the room who has voted. The percent is the share
of +1 votes, 0 to 100. Example: 3 up and 1 down shows 'rated 2', percent 75."

# Consequences

- [s4-07](/tasks/s4-07-room-extras.md) applies it.
