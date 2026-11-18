---
type: Task
title: The game starts, stops and answers who is online
description: The services package gains the Hotel contract and the two online questions, the game implements them with Start, Stop and Status, its /api/ and its client carry them, and the runners inject Hotel.
scope: [packages/services, packages/settings, packages/virtual, packages/server, packages/reborn, packages/cms, packages/housekeeping, apps/reborn, apps/server, apps/cms, apps/housekeeping]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

Every behaviour under "The game" of the [spec](/features/hotel-status/spec.md).

# Context

- [Spec](/features/hotel-status/spec.md)
- [Plan](/features/hotel-status/plan.md): the contract is the user's, build it exactly as written there.
- `packages/services/knowledge`: the rules of a contract and of its `/api/` twin.
- `packages/server/server.go`: `StartInfo`, `StartMus`, `listen`, `listenAPI`, `SendLook`. `packages/server/api`: the
  client the programs run apart inject. `packages/server/internal/router`: the `/api/` handlers.
- `packages/virtual/habbo`: the habbos online, each with its session.
- `packages/server/knowledge/r26/hh_entry_init.md`, message 292, and
  `packages/client-r26/src/game/hh_entry_init/13_Opening Hours Handler Class.ls` (read it through `tr '\r' '\n'`):
  what the client shows for it.
- `game.Logout` in `packages/server/internal/game`: how a habbo leaves, with its last time online saved.

# Steps

- [ ] `packages/services`: `Hotel`, `HotelStatus`, and `AreOnline` and `Online` on `Habbos`, as the plan shows.
- [ ] `packages/settings`: `game.closed`, a boolean, false by default.
- [ ] `packages/virtual/habbo`: `Count() int` and `IDs() []int64`.
- [ ] `packages/server`: `Start(ctx)` opens the info and mus listeners when `game.closed` and `site.maintenance` are
  both false, and replaces `StartInfo` and `StartMus`; a second `Start` with the doors open does nothing. `Stop(ctx)`
  closes both listeners, sends each session message 292 with its disconnect flag, logs each habbo out, closes the
  connections and waits for them until `ctx` ends. `Status`, `AreOnline`, `Online`.
- [ ] The five routes of `/api/` in the plan, one handler file per path, behind the secret; `packages/server/api`
  gains the five calls, so its value satisfies `services.Hotel` and `services.Habbos`.
- [ ] `cms.Services` and `housekeeping.Services` gain `Hotel services.Hotel`, kept in their routers' deps for the
  next tasks; every runner injects it beside `Habbos`; `packages/reborn` and `apps/server` call `Start`.
- [ ] One test per behaviour of the goal. In a real browser, with the client's files of the main checkout
  (`/mnt/media/Projects/habbo/assets` and `packages/cms/public/libreshockwave`, read only) on a hotel of your own in a
  temporary folder: stop the game with a habbo in a room, and report with a screenshot what the client shows.
- [ ] Update the knowledge of `packages/services`, `packages/server`, `packages/virtual` and `packages/reborn`.

# Checks

```sh
make -C packages/services check
make -C packages/server check
```

Then `make check` in every project you changed and in every project `make dependants project=<folder>` prints for
them, and `make e2e` once, since the game's start changed.
