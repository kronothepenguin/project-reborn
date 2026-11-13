---
type: Decision
title: Every program reads settings from the store, and nothing refreshes
description: The CMS, housekeeping, the installer, auth and the game server read each setting with a sqlc query through packages/settings, which returns the declared default when there is no row; virtual/settings and every refresh go, and the game checks for waiting database updates on use.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, settings, store, server, cms, housekeeping]
---

# Decision

- A setting is read from the database when it is used, in every program: `settings.String(ctx, q, "site.name")`, with
  `Int` and `Bool` beside it. Each runs a new sqlc query, `GetSetting(key)`, turns the row's JSON text into the type,
  and returns the declared default when the hotel has no row, as a row exists only when a value differs from its
  default. `q` is `store.New(db)`, or the transaction's queries inside a transaction.
- A new package, `packages/settings`, holds the list of settings with their defaults and checks, these reads, and the
  validated writes. `packages/virtual/settings` and its in-memory copy go; `packages/virtual` keeps only the game's
  real-time state.
- Nothing refreshes: the CMS's and the game's reload every `cms.refresh` seconds go, and so does the setting.
- The game server checks for waiting database updates when a player logs in or asks for what it caches, and loads its
  cache the first time none waits. It never stops for waiting updates.
- The checks that tie two settings together run when a setting is saved; a read trusts the rows.
- A page of the CMS and the game's busiest handlers are measured before and after; a cache is added only if the numbers
  call for one.

# Context

The user, on keeping settings in memory: "i'm wondering if we really need virtual for cms and hk. or just read the
database is good enough and don't need this kind of performance enhance here... again. virtual is a cache + state. i
just wanted an easy way to work with the db, but looks like using store directly is the way to go. i think a full
refactor is a better way of doing this, we can measure first if tons of reads really need any performance enhance or
it's just good to read from db as php did." And: "can't we just use the store and sqlc query to get specific setting?"
Asked where settings live, the user chose to move them out of `virtual`.

On the game: "make the game server read from db directly, i think it won't read something like settings a lot... but
something like rooms, i prefer a cache for loaded rooms (rooms with habbos), because placing/moving/picking furnis,
chats, and everything else will be a lot." On the refresh: "i think better remove refresh".

# Consequences

- Supersedes `knowledge/decisions/holo-port/0029-package-level-settings-and-auth.md`. Its other points stand: `packages/auth`
  is a set of package-level helpers that receive the db; app packages take the db as `New`'s first argument, and
  options are only for what differs between runners (now also reborn and a program run alone,
  [0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md)); the installer keeps its own config step.
- Supersedes `knowledge/decisions/holo-port/0051-one-machine-and-a-refresh.md`. Its other points stand: SQLite stays, the
  programs run on one machine, no program but housekeeping writes settings after the install.
- Supersedes `knowledge/decisions/server/0050-the-server-loads-and-reloads-the-settings.md` and the check every
  `cms.refresh` seconds of `knowledge/decisions/server/0064-the-navigator-loads-once-the-updates-are-applied.md`. The rest
  of 0064 stands: the navigator loads when no update waits, and the server never stops for waiting updates.
- About 190 calls change, in the CMS, housekeeping, the installer, auth and the game server.
