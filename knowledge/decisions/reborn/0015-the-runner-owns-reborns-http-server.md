---
type: Decision
title: The runner owns reborn's HTTP server, and reborn builds its programs
description: apps/reborn's runners create, close and replace the HTTP server; packages/reborn builds the site, housekeeping, the installer and the game, mounts their routes on a mux it receives, and has Start and Stop for the game.
status: accepted
timestamp: 2026-11-20T19:15:37-05:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-20T19:15:37-05:00"}
tags: [platform, orchestrator, reborn]
---

# Decision

- The runners in `apps/reborn/cmd/*` own the `http.Server`: they create it, close it and start a new one.
- `packages/reborn` builds the site, housekeeping, the installer and the game, since they are what reborn depends on.
  It injects the game into the site and housekeeping.
- `packages/reborn` mounts routes on a mux it receives, as the other packages do.
- `packages/reborn` has `Start` and `Stop` for what starts and stops: the game. `Start` returns its error. `Run` goes.
- `packages/reborn` receives an interface that moves the HTTP server to a new address. The runner implements it.
- A hotel that is not installed gets an HTTP server for the installer alone, whose root handler sends every page to
  `/installer/`. Once the administrator exists, the runner closes that server and starts a new one for the site and
  housekeeping, and the game starts.
- An installed hotel gets the site and housekeeping mounted and the game started.
- The runner's `main` waits for the installation on a channel. `packages/reborn` starts no goroutine for it.
- One Astro project in `packages/reborn` imports the frontends of the site, housekeeping and the installer and builds
  one `dist` for development and production alike. A spike proves it first
  ([platform](/features/platform/plan.md)).
- The scheduler stays as it is ([0016](/decisions/reborn/0016-lifecycle-names-come-in-pairs.md)).

# Context

On 2026-11-20 the master proposed `Start`, `Stop` and `Failed` on today's `packages/reborn`, which owns the HTTP server
and is handed the programs its runner builds. The user:

"Start + Stop alone, start should return whatever error it has, i don't like what you did at old designing rebor
package... i prefer the start to create the instances for cms, housekeeping and installer because the are something
reborn depends on, not the runner. and we should move the creation of the http to the runner. reborn.Start then mounts
the routes. let's discuss better about the step by step for `packages/reborn` it looks like a mess to me as it's today.
What i expected before:

- `apps/reborn/cmd/*` to have the http server
- `apps/reborn/cmd/*` to have a way for stop old http and start a new one
- `packages/reborn` to own the creation of cms, housekeeping and installer
- `packages/reborn` to use astro or vite to import cms, housekeeping and installer frontends, so we don't have to worry
  about different `/@vite/dev` stuff
- `packages/reborn` to mount the routes for cms, housekeeping and installer
- `packages/reborn` to have Start + Stop for something that needs that, like game server
- `packages/reborn` to receive the mux as the other packages did, se can keep the same muxer in the long run even if we
  change the `http.Server` when move the port
- `packages/reborn` to receive an interface for moving the port of the http server
- `packages/reborn` to define a dynamic middleware or something to handle the installer redirect, do not use goroutines
  for wainting for install, just use a loop waiting for a channel"

On the frontends: "is it possible to merge three project insto reborn? so we have the same for dev and prod, when build
reborn generates its own dist with all the assets from cms, installer and housekeeping."

On the code two runners share: "does installer have the same code? if so, then create something in packages better, so
we keep same logic for installer standalone and serve by reborn." Run alone, the installer stays on its port and moves
nothing (`apps/installer/cmd/installer/main.go`).

On the flow: "how does the user install if reborn hasn't started yet? i expect something like:

- if not installed, just start the installer with a custom root handler to redirect everything to `/installer/`
- if installed, mount cms & housekeeping and start the game server
- if it's the first time so it's not installed, start an http server for installer only, then close that server and
  start a new one for cms & housekeeping"

# Consequences

- It replaces [0007](/decisions/reborn/0007-reborn-stops-in-order.md): the runner lets the open requests finish, calls
  reborn's `Stop` and closes the database.
- It replaces three parts of earlier decisions: the HTTP server inside `packages/reborn` and "`main.go` only wires" of
  [0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md); "reborn implements" the `Listener` of
  [0004](/decisions/reborn/0004-the-installer-inside-reborn.md), which the runner implements; and the shape of
  2026-11-15, `reborn.New(cfg, db, c, h, i, g)` with the programs built by the runner.
- The dev-only Astro project of [0009](/decisions/reborn/0009-one-dev-server-for-reborn.md) becomes a built one when
  the spike passes.
- A listener that dies is the runner's to handle, since the runner serves it.
