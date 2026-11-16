---
type: Task
title: Read the game's secret on each call
description: The client of the game's /api/ takes the database and reads the secret when it calls, so the CMS and housekeeping need no restart after the update that creates it.
scope: [packages/server, apps/cms, apps/housekeeping]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

A hotel upgraded from an older release tells the game of a new look as soon as the update is applied
([Plan](/features/habbos/plan.md), its last decision). The behaviour of the spec:

- The game's secret is created or changed while the site runs: the next call to the game uses it, with no restart.

# Context

- [Spec](/features/habbos/spec.md)
- [Plan](/features/habbos/plan.md)
- `packages/server/knowledge/architecture.md`: the `/api/`, `packages/server/api` and the secret.
- Today `api.New(baseURL, secret)` takes the secret, and the four runners of the CMS and housekeeping read it once at
  start; when the read fails they log "the game's api is off" and run without the service.
- The game reads the secret on each request already.

# Steps

- [ ] `api.New(baseURL string, db *sql.DB) *Client`: `SendLook` reads the secret with the store's query, then calls
  `POST /api/habbos/{id}/look`, with its 2 seconds as today. A hotel with no secret yet returns an error, which the
  caller logs.
- [ ] The four runners (`cms`, `cms-dev`, `housekeeping`, `housekeeping-dev`) inject `api.New("http://"+addr, db)`
  and read no secret at start.
- [ ] One test of the behaviour: the client is built before the secret exists; a call fails; the secret is created;
  the next call reaches the game.
- [ ] Update `packages/server/knowledge` and the runners' READMEs where they describe the secret.

# Checks

```sh
make -C packages/server check
make -C apps/cms check
make -C apps/housekeeping check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/server`.
