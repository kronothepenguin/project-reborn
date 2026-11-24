---
type: Task
title: The friends list and friend requests in the game
description: The game saves friendships and waiting requests, sends a habbo its friends list at login and its changes on each update, and handles asking, accepting, declining and removing within the three limits.
scope: [packages/store, packages/settings, packages/server, packages/housekeeping]
depends_on: []
skills: [adding-data-persistence, applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

Two habbos become friends in the client and stay friends after a restart.

# Context

- [Spec](/features/messenger/spec.md), `### The friends list` and `### Friend requests` under `## Next`.
- [Plan](/features/messenger/plan.md): the decisions and the notes.
- `packages/server/knowledge/r26/hh_friend_list.md`: messages 12, 13, 132, 260, 314 and commands 12, 15, 37, 38, 39,
  40, 233.
- `source/holoemu`, for what Holo answered.

# Steps

- [ ] The store: two tables, friendships and waiting requests, with their queries, in the next update.
- [ ] The three settings of the plan, declared with Holo's numbers, in a group housekeeping's settings page shows.
- [ ] At login: the friends list with the limits, then the waiting requests.
- [ ] On the client's update: what changed among the habbo's friends since its last update.
- [ ] Asking, accepting, declining and removing, each with the client's own errors for the cases of the spec.
- [ ] Tests for each behaviour of the two sections.
- [ ] Update `packages/server/knowledge`, move the spec's lines up, and note the tables and settings in the plan.

# Checks

```sh
make -C packages/store check
make -C packages/settings check
make -C packages/server check
```

Then `make check` in every project that `make dependants project=<folder>` prints for the three, and `make e2e`.
