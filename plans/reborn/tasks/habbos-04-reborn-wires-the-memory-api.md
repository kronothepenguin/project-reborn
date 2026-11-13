---
type: Task
title: reborn passes the game to the site and housekeeping
description: packages/reborn builds the memory API around the game's instance and injects it into the CMS and housekeeping, in the order constructors, services, Inject, run.
status: todo
slice: habbos
depends_on: [habbos-02, habbos-03, platform-03]
packages: [packages/reborn]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Under reborn, a look saved on the site reaches the game in the same process
([0005](/decisions/0005-the-game-hears-live-changes-through-services.md)).

# Steps

- [ ] The memory API in `packages/reborn`: it holds the game's `*server.Server` and implements `services.Habbos` by
  calling its `SendLook`.
- [ ] `Run` builds the CMS, housekeeping and the game, then the memory API, then calls `Inject` on the CMS and
  housekeeping, then mounts and starts them.
- [ ] Tests: under reborn on free ports, a habbo logged in through the game's test client in a room sees its new look
  after the CMS's looks page saves it, and its new motto after housekeeping saves it.

# Verification

```sh
cd packages/reborn && go vet ./... && go test ./... -race
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `habbos-04`. If [platform-05](/tasks/platform-05-reborn-installs-a-new-hotel.md) is merged first,
  the hotel built after an install is injected the same way.
