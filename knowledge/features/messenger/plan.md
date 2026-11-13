---
type: Plan
title: "Messenger: friends and their chat: how"
description: The game runs the friend list and the instant messenger, the store saves friendships, and the site shows friends.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/server` | `hh_friend_list` (`packages/server/knowledge/r26/hh_friend_list.md`): the list, requests, search, follow, mail notices; `hh_instant_messenger` (`packages/server/knowledge/r26/hh_instant_messenger.md`): messages and invitations |
| `packages/store`, `packages/virtual` | Friendships and requests saved; who is online and instant messages only in memory ([server 0011](/decisions/server/0011-saved-and-memory-only-data.md)) |
| `packages/cms` | The site's My Friends menu, which the port deferred ([Holo's differences](/sources/holocms/differences.md)) |

What Holo did, read for the questions below: it saved friendships and requests in two tables and had no categories; it
told the client 200 friends, 600 for club members, and 200 waiting requests, and enforced none; any friend who was
online and in a room could be followed, and the follower then met that room's door like anyone; it never sent the mail
notices 363 and 364; an instant message reached only a friend who was online; and HoloCMS read the friendships for its
quick menu (`source/holocms/quickmenu.php`).

# Decisions

The user's decisions are written here when the feature is planned.
