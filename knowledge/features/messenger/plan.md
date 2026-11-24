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
quick menu (`source/holocms-1.3.1/quickmenu.php`).

# Decisions

Of 2026-11-24, each the user's choice among options put to them.

- The game's part is built first, beside the site's styling ("Messenger", among the server work to start).
- Friendships and waiting requests are saved; there are no friend categories; who is in the hotel and the chat's
  lines live in memory alone ("Friends and requests, no categories").
- The game enforces Holo's numbers, which Holo only told the client: 200 friends, 600 with club, 200 waiting
  requests, as three settings ("Enforce Holo's numbers"): `messenger.maxFriends`, `messenger.maxFriendsClub` and
  `messenger.maxRequests`.
- A friend who is in a room can be followed, and the follower meets the door as anyone ("As Holo").
- The mail notices 363 and 364 are sent when the minimail exists; the master's choice until the user plans it.

# Notes

- The protocol is in `packages/server/knowledge/r26/hh_friend_list.md` and `hh_instant_messenger.md`: the messages,
  the commands, the errors and the client's quirks.
- A request to a habbo in the hotel goes at once as message 132; a friend's change goes in the answer to the client's
  own `FRIENDLIST_UPDATE`, which it sends on a timer.
- The store gains two tables, for friendships and for waiting requests, in the next update after `0028`.
