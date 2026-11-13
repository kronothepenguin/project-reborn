---
type: Spec
title: "Platform: reborn runs the whole hotel"
description: The orchestrator reborn runs the installer, the site, housekeeping and the game server in one process, installs a new hotel live, stops in order and ships beside the four separate programs; every program reads settings from the store.
status: active
projects: [apps/server, apps/reborn, packages/reborn, packages/server, packages/cms, packages/housekeeping, packages/installer, packages/config, packages/scheduler, packages/settings, packages/store, packages/auth, packages/virtual, tests/e2e]
---

# What

One binary runs the whole hotel, and the separate programs still run on their own
([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)).

The user: "now that we have cms + housekeeping + server, we can start the orchestractor, it can be a folder in apps only
called "reborn", this should keep installer + cms + housekeeping in the same mux and run the server too."

# Behaviours

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
- The browser suite `reborn` passes.
