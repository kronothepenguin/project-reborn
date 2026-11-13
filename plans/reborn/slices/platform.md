---
type: Slice
title: Platform: reborn runs the whole hotel
description: The orchestrator reborn runs the installer, the site, housekeeping and the game server in one process, installs a new hotel live, stops in order and ships beside the four separate programs; every program reads settings from the store.
status: active
projects: [apps, reborn, server, cms, housekeeping, installer, config, scheduler, settings, store, auth, virtual, tests]
depends_on: []
from: ["plans/later.md", "plans/server/phases/s9-site-changes.md"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, orchestrator]
---

# Goal

One binary runs the whole hotel, and the separate programs still run on their own
([0003](/decisions/0003-reborn-runs-the-hotel-in-one-process.md)).

The user: "now that we have cms + housekeeping + server, we can start the orchestractor, it can be a folder in apps only
called "reborn", this should keep installer + cms + housekeeping in the same mux and run the server too."

# Scope

| Project | Part |
| --- | --- |
| `apps/server`, `packages/server` | The unused HTTP listener on 15445 is gone ([platform-01](/tasks/platform-01-drop-the-unused-listener.md)) |
| `packages/config` | The `reborn` section: `localhost:16416` |
| `packages/reborn`, `apps/reborn` | The orchestrator: one mux, one database handle, the game's listeners ([0003](/decisions/0003-reborn-runs-the-hotel-in-one-process.md)); installing a new hotel ([0004](/decisions/0004-the-installer-inside-reborn.md)); stopping in order ([0007](/decisions/0007-reborn-stops-in-order.md)); one dev server ([0009](/decisions/0009-one-dev-server-for-reborn.md)) |
| `packages/installer` | Under `/installer/`, its two forms, `Listener`, no done page ([0004](/decisions/0004-the-installer-inside-reborn.md)) |
| `packages/settings` and every program | Settings read from the store, no refresh, `virtual/settings` gone ([0006](/decisions/0006-settings-are-read-from-the-store.md)) |
| `packages/server`, `packages/scheduler` | `Shutdown` and `Stop` ([0007](/decisions/0007-reborn-stops-in-order.md)) |
| `tests/e2e` | A browser suite for reborn |
| releases | reborn and the four separate programs ([0008](/decisions/0008-releases-ship-reborn-and-the-separate-programs.md)) |

How programs tell the game of a live change is [0005](/decisions/0005-the-game-hears-live-changes-through-services.md);
its first service is built in [habbos](/slices/habbos.md), and each feature slice adds its own.

# Exit criteria

- From an empty folder, reborn serves the installer at `/installer/` on `localhost:16416` and redirects every other path
  there. A new port in the config step moves the browser to it and closes the old one. After "Create administrator"
  the browser lands on the site at `/`, `/installer/` answers 404, housekeeping answers at `/housekeeping/` and the game
  on 30000 and 30001.
- An installed folder starts straight into the hotel, and `/installer/` answers 404.
- Every program reads its settings from the store, nothing refreshes, `packages/virtual/settings` is gone, and the
  measurements before and after are written in their tasks.
- Ctrl-C stops reborn in order, and the players online are logged out.
- `make dev` serves every site with live reload through `reborn-dev`, or the spike's failure is settled with the user.
- A release holds `reborn`, `cms`, `housekeeping`, `installer` and `server`.
- The browser suite `reborn` and every gate pass.

# Tasks

1. [platform-01 Drop the game server's unused HTTP listener](/tasks/platform-01-drop-the-unused-listener.md) **done**
2. [platform-02 The reborn section of config.json](/tasks/platform-02-reborn-config-section.md)
3. [platform-03 reborn runs an installed hotel](/tasks/platform-03-reborn-runs-an-installed-hotel.md)
4. [platform-04 The installer under /installer/, with its two forms](/tasks/platform-04-installer-under-installer.md)
5. [platform-05 reborn installs a new hotel](/tasks/platform-05-reborn-installs-a-new-hotel.md)
6. [platform-06 packages/settings reads settings from the store](/tasks/platform-06-settings-package.md)
7. [platform-07 The CMS reads settings from the store](/tasks/platform-07-cms-reads-settings.md)
8. [platform-08 Housekeeping and the installer read settings from the store](/tasks/platform-08-housekeeping-installer-read-settings.md)
9. [platform-09 The game reads settings from the store and checks for updates on use](/tasks/platform-09-game-reads-settings.md)
10. [platform-10 reborn stops in order](/tasks/platform-10-reborn-stops-in-order.md)
11. [platform-11 Spike: one Astro dev server for every site](/tasks/platform-11-spike-one-dev-server.md)
12. [platform-12 reborn-dev and make dev](/tasks/platform-12-reborn-dev.md)
13. [platform-13 The browser suite reborn](/tasks/platform-13-browser-suite.md)
14. [platform-14 Releases ship reborn and the four programs](/tasks/platform-14-releases.md)
15. [platform-15 The documents](/tasks/platform-15-documents.md)
16. [platform-16 Check the exit criteria](/tasks/platform-16-exit-check.md)
