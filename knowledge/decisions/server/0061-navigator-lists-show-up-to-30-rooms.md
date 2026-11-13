---
type: Decision
title: A navigator list shows at most 30 rooms
description: A category's habbo rooms and a search's results are each capped at 30 rooms, two settings, as Holo capped them.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, navigator]
---

# Decision

- A category lists at most 30 habbo rooms, and a search returns at most 30, two settings.

# Context

Holo capped both at 30 (`navigator_opencategory_maxresults`, `navigator_roomsearch_maxresults`). Offered the same, or
no limit, the user chose "30 each, as Holo (Recommended)": "Two settings, both 30: a category shows at most 30 habbo
rooms and a search returns at most 30. Example: a search for "party" matching 80 rooms lists 30."

# Consequences

- [s3-01](/tasks/s3-01-navigator-tables.md) declares the settings, and [s3-03](/tasks/s3-03-browsing.md) and
  [s3-04](/tasks/s3-04-room-lists.md) apply them.
