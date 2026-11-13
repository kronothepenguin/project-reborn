---
type: Plan
title: "Platform: reborn runs the whole hotel: how"
description: packages/reborn runs every program on one mux, the installer moves under /installer/, settings come from the store, and releases ship every runner.
---

# Architecture

| Project | Part |
| --- | --- |
| `apps/server`, `packages/server` | The unused HTTP listener on 15445 is gone (done) |
| `packages/config` | The `reborn` section: `localhost:16416` |
| `packages/reborn`, `apps/reborn` | The orchestrator: one mux, one database handle, the game's listeners ([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)); installing a new hotel ([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)); stopping in order ([0007](/decisions/reborn/0007-reborn-stops-in-order.md)); one dev server ([0009](/decisions/reborn/0009-one-dev-server-for-reborn.md)) |
| `packages/installer` | Under `/installer/`, its two forms, `Listener`, no done page ([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)) |
| `packages/settings` and every program | Settings read from the store, no refresh, `virtual/settings` gone ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)) |
| `packages/server`, `packages/scheduler` | `Shutdown` and `Stop` ([0007](/decisions/reborn/0007-reborn-stops-in-order.md)) |
| `tests/e2e` | A browser suite for reborn |
| releases | reborn and the four separate programs ([0008](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md)) |

How programs tell the game of a live change is
[0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md); its first service is built in
[habbos](/features/habbos/spec.md), and each feature adds its own.

# Decisions

- [reborn runs the hotel in one process, and the separate programs
  stay](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md) — apps/reborn runs the installer, the site,
  housekeeping and the game server in one process on one mux with one database handle, its logic in packages/reborn and
  its address in a new reborn section of config.json; the standalone runners stay, for work on one program and for
  testing how programs talk.
- [Inside reborn the installer lives under /installer/, moves the hotel to the address it is given, and goes once
  installed](/decisions/reborn/0004-the-installer-inside-reborn.md) — reborn serves the installer under /installer/
  until an administrator exists, asks one host and port for the whole site and moves its listener to them at once, and
  answers 404 under /installer/ once installed; run alone the installer keeps today's form; the done page goes.
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) — Changes the game must show at once
  reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory
  implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store
  nothing.
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md) — The CMS, housekeeping, the installer, auth
  and the game server read each setting with a sqlc query through packages/settings, which returns the declared default
  when there is no row; virtual/settings and every refresh go, and the game checks for waiting database updates on use.
- [reborn stops in order](/decisions/reborn/0007-reborn-stops-in-order.md) — On Ctrl-C or SIGTERM reborn stops taking
  requests, logs every player out and closes the game's listeners, stops the scheduled tasks and closes the database,
  with new Shutdown and Stop functions in the game server and the scheduler.
- [Releases ship reborn and the four separate
  programs](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md) — Each release archive holds
  reborn and the standalone CMS, housekeeping, installer and game server, so that an administrator chooses one binary or
  several.
- [reborn's dev runner proxies one Astro dev server for every site, after a spike proves
  it](/decisions/reborn/0009-one-dev-server-for-reborn.md) — A dev-only Astro project in packages/reborn serves the
  CMS's pages at /, housekeeping's at /housekeeping/ and the installer's at /installer/ from one dev server, so that
  reborn-dev proxies it as the standalone dev runners proxy theirs; a spike proves it first.
