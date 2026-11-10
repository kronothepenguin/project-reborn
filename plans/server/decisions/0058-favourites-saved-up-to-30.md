---
type: Decision
title: Favourite rooms are saved, up to 30
description: A habbo's favourite rooms are saved per habbo, up to 30, a setting; one more gets 33 Only 10 favorite rooms allowed!, which the client shows as its own text.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, navigator, data]
---

# Decision

- A habbo's favourite rooms, public rooms and habbo rooms alike, are saved per habbo.
- A habbo keeps up to 30, a setting. One more gets 33 `Only 10 favorite rooms allowed!`, the text the client turns into
  `nav_error_toomanyfavrooms`, whatever number it says.

# Context

Offered saving up to 30, as Holo did, or up to 10, as the client's error text says, the user chose "Saved, up to 30
(Recommended)": "As Holo: saved per habbo, up to 30 rooms (a setting); a 31st gets the error, whatever number its text
says."

# Consequences

- [s3-01](/tasks/s3-01-navigator-tables.md) adds the table, and [s3-05](/tasks/s3-05-favourites.md) serves them.
