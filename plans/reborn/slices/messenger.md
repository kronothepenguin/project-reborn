---
type: Slice
title: Messenger: friends and their chat
description: Habbos keep a friends list, send and answer friend requests, search for habbos, follow friends into rooms and chat with friends who are online, and the site shows a habbo's friends.
status: planned
projects: [store, virtual, server, cms]
depends_on: []
from: ["plans/server/phases/s6-friends.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [friends, messenger]
---

# Goal

Habbos keep a friends list, send and answer friend requests, search for habbos, follow friends into rooms, and chat with
friends who are online. It was the server's phase S6.

# Scope

| Project | Part |
| --- | --- |
| `packages/server` | `hh_friend_list` (`plans/server/reference/r26/hh_friend_list.md`): the list, requests, search, follow, mail notices; `hh_instant_messenger` (`plans/server/reference/r26/hh_instant_messenger.md`): messages and invitations |
| `packages/store`, `packages/virtual` | Friendships and requests saved; who is online and instant messages only in memory (`plans/server/decisions/0011-saved-and-memory-only-data.md`) |
| `packages/cms` | The site's My Friends menu, which the port deferred (`plans/holo-port/reference/holo-differences.md`) |

What Holo did, read for the questions below: it saved friendships and requests in two tables and had no categories; it
told the client 200 friends, 600 for club members, and 200 waiting requests, and enforced none; any friend who was
online and in a room could be followed, and the follower then met that room's door like anyone; it never sent the mail
notices 363 and 364; an instant message reached only a friend who was online; and HoloCMS read the friendships for its
quick menu (`source/holocms/quickmenu.php`).

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

From `plans/server/phases/s6-friends.md`, as written there:

- "Whether friendships and friend categories are saved."
- "The friend and request limits, for members and for club members."
- "Who can be followed."
- "Where the mail that the client's mail notices count comes from."
- "How the site shows who is online while it runs apart from the server
  (`plans/server/decisions/0011-saved-and-memory-only-data.md`)." This one is [presence and
  rooms](/slices/presence-and-rooms.md)'s now.
