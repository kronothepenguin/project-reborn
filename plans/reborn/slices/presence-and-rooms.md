---
type: Slice
title: Presence and rooms on the site
description: The site and housekeeping show who is in the hotel and where: the online count and states, Online Users, My Rooms, recommended rooms and the first-login room picker.
status: planned
projects: [server, virtual, cms, housekeeping]
depends_on: [platform]
from: ["plans/server/phases/s6-friends.md", "plans/later.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [presence, rooms, cms]
---

# Goal

What only the game server knows shows on the site: how many habbos are online, whether a habbo is, and the rooms it has.

# Scope

| Project | Part |
| --- | --- |
| `packages/server` | Answers the site's questions: the online count, where a habbo is |
| `packages/cms` | The online count and the hotel's status on every page; the online state on the profile widget, the community page, the staff page and the forum's posts; My Rooms and the recommended rooms; `welcome.php`, the room picker of a first login |
| `packages/housekeeping` | Online Users; the online count beside Members on the dashboard |

All of it was deferred by `plans/holo-port/decisions/0013-defer-game-server-features.md` and is listed under "Waiting
for a later phase" in `plans/holo-port/reference/holo-differences.md`. The game server learning that a habbo was
archived on the site (`plans/later.md`) is answered with [platform](/slices/platform.md)'s notices.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- What "online" means on the site: in the hotel now, asked of the game server; or, as Holo meant it, a page of the site
  opened in the last 10 minutes ([the communication
  study](/reference/research-communication.md#the-site-asks-the-game-server)).
- What the site shows while the game server is not running.
- Whether the first-login room picker is ported as Holo's `welcome.php`.
