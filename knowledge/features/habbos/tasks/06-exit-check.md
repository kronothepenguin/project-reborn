---
type: Task
title: Check the habbos feature's behaviours
description: The user's demonstration is run under reborn and with the separate programs, and its evidence written in the report.
scope: []
depends_on: [04-reborn-wires-the-memory-api, 05-the-games-api, client/02-the-client-page]
skills: []
---

# Goal

The habbos feature is done, with evidence for each behaviour of [the spec](/features/habbos/spec.md).

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- The master shows the result to the user and closes the feature.

# Steps

- [ ] Under reborn, with the client files of the main checkout: sign in on the site, open the client, enter a room, see
  the habbo; a second habbo in the same room.
- [ ] Save a new look on the site's looks page, a motto on the motto page and on the profile page, and both in
  housekeeping's habbo editor: each shows in both clients at once. Screenshots kept in the scratchpad, and the steps
  written in the report.
- [ ] With the separate programs and the runners of [05](/features/habbos/tasks/05-the-games-api.md), the same
  through the game's `/api/`; a request without the secret is answered 404.
- [ ] What fails becomes a new task of the feature.

# Checks

```sh
make check
```
