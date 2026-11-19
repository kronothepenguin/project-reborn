---
type: Decision
title: The online picture stays offline until the game server
description: Forum posts, the profile widget, the community page and the staff page show every habbo offline, as Holo did in practice, until the game server exists.
status: superseded
superseded_by: knowledge/features/hotel-status/plan.md
timestamp: 2026-11-04T20:35:37+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:35:37+00:00"}
tags: [forum, p5]
---

# Decision

- The online picture shows offline everywhere, the forum's post boxes included, until the game server exists
  ([0013](/decisions/holo-port/0013-defer-game-server-features.md)).

# Context

Holo meant online as a page view of the site in the last 10 minutes (`core.php`), but `install.php` made
`users.online` a MEDIUMINT, which cannot hold the time, so every habbo showed offline. P4's pages already show offline.
The user chose to keep it so over making Holo's rule work now.
