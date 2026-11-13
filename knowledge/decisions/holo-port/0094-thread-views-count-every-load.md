---
type: Decision
title: A thread counts a view on every load
description: Every load of a thread's page adds one to its views, reloads included, as in Holo, and P5's rule that nothing changes on a GET covers the group page's writes.
status: accepted
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
tags: [forum, p5]
---

# Decision

- Every load of a thread's page adds one to its Views, reloads included, as Holo's `viewthread.php` did.
- P5's rule that nothing changes on a GET covers the group page, where Holo deleted join requests and inserted a widget
  whenever someone viewed it. A view counter changes nobody's data.

# Context

[P5](/phases/p5-groups-forum.md)'s settled fixes said that nothing changes on a GET. Asked whether the forum still
counts a view on each load, or through a POST that the page sends once it has loaded, the user chose Holo's count on
every load.
