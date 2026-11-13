---
type: Spec
title: "Platform: reborn runs the whole hotel"
description: The installer, the site, housekeeping and the game server run as four programs on one SQLite file, tested and released by GitHub Actions; the orchestrator reborn runs them in one process, installs a new hotel live, stops in order and ships beside them, and every program reads settings from the store.
status: active
projects: [apps/server, apps/cms, apps/housekeeping, apps/installer, apps/reborn, packages/reborn, packages/server, packages/cms, packages/housekeeping, packages/installer, packages/config, packages/scheduler, packages/settings, packages/store, packages/auth, packages/virtual, tests/e2e]
---

# What

The installer, the CMS, housekeeping and the game server run as four separate programs on one SQLite file. Each one
works on an empty database, reads the root `config.json` in development, and guards its forms against other sites.
GitHub Actions runs every gate on each push, and a version tag publishes prebuilt archives for Linux.

Next:

One binary runs the whole hotel, and the separate programs still run on their own
([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)).

The user: "now that we have cms + housekeeping + server, we can start the orchestractor, it can be a folder in apps only
called "reborn", this should keep installer + cms + housekeeping in the same mux and run the server too."

# Behaviours

## Running alone

- The CMS starts in an empty folder: it writes a default `config.json`, creates the database with every update, and
  serves its pages with the default values (decision holo-port/0068).
- Housekeeping starts on an empty database: it creates it the same way and uses the default values
  (decision holo-port/0068).
- The installer runs on a database another program created: it changes the defaults and creates the administrator
  (decision holo-port/0068).
- `make dev` starts a runner: it runs from the repository root, so every runner reads and writes the root
  `config.json` and database (decision holo-port/0027).
- `cms.host` is set to `0.0.0.0`: the CMS listens on every interface; its default is `localhost`
  (decision holo-port/0037).
- The game server starts: it opens only its game listeners, on `server.info` (30000) and `server.mus` (30001).

## Requests

- A page on another site posts a form to the CMS, housekeeping or the installer: it is refused with status 403.
- `proxy.enabled` is false, its default: every request keeps the address of its connection
  (decision holo-port/0028).
- `proxy.enabled` is true and a request comes from a trusted proxy: the client's address is read from
  `X-Forwarded-For`, from the right, skipping trusted proxies; requests from other addresses keep their own
  (decision holo-port/0028).

## CI and releases

- A push to `main` or a pull request: GitHub Actions runs every gate and the browser suites (decision reborn/0008).
- `make e2e` runs: it builds the programs, installs a throwaway hotel and runs every browser suite on it; with port
  17306 busy, it refuses to start.
- A tag like `v1.2.3` is pushed: the gates and the browser suites run, then a release publishes
  `reborn-<tag>-linux-amd64.tar.gz`, `reborn-<tag>-linux-aarch64.tar.gz` and `SHA256SUMS` (decision reborn/0008).
- An archive is unpacked: it holds static `cms`, `housekeeping` and `installer` binaries, which run with no network.

## Next

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
