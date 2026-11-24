---
type: Task
title: Demonstrate the messenger with the real client
description: Two habbos become friends, find, follow and write to each other in real clients under reborn, with screenshots, and the documents say what is built.
scope: [knowledge, tests/e2e]
depends_on: [02-search-follow-and-chat]
skills: [testing-behaviours, documenting-with-okf]
---

# Goal

The user sees the messenger work, and the knowledge says so.

# Context

- [Spec](/features/messenger/spec.md) and [plan](/features/messenger/plan.md).
- `tests/e2e/lib/hotel.mjs` and `lib/game.mjs`; the hotel status exit check's way of driving the real client.

# Steps

- [ ] A browser suite: two habbos over the game's own protocol ask, accept, see each other online, write, and are
  friends still after a restart.
- [ ] Under reborn with two real clients: the friends list window, a request and its answer, a search, a follow into a
  room, a chat. Screenshots of each step.
- [ ] Root `make check` and `make e2e`.
- [ ] Report the steps for the user to repeat on their own hotel, and every fault as a finding.

# Checks

```sh
make check
make e2e
```
