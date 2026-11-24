---
type: Task
title: Search, follow and the chat between friends
description: The game answers the habbo search, takes a habbo to the room of a friend it follows, and carries the chat's lines and invitations between friends in the hotel.
scope: [packages/server]
depends_on: [01-friends-and-requests]
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

Friends find each other, meet in a room and talk.

# Context

- [Spec](/features/messenger/spec.md), `### Search and follow` and `### The chat` under `## Next`.
- [Plan](/features/messenger/plan.md).
- `packages/server/knowledge/r26/hh_friend_list.md` (commands 41 and 262, messages 435 and 349) and
  `hh_instant_messenger.md` (commands 33 and 34, messages 134, 135, 261, 262).
- How a habbo enters a room: `packages/server/knowledge` and [rooms](/features/rooms/spec.md).

# Steps

- [ ] The habbo search: names that start with the text, friends first.
- [ ] Follow: the client is sent to the friend's room, and the cases of the spec get the client's own reasons.
- [ ] The chat: a line to a friend in the hotel, the errors for the others, and invitations.
- [ ] Tests for each behaviour of the two sections.
- [ ] Update `packages/server/knowledge` and move the spec's lines up.

# Checks

```sh
make -C packages/server check
```

Then `make check` in every project that `make dependants project=packages/server` prints, and `make e2e`.
