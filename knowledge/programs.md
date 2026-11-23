---
type: Reference
title: How the programs work together
description: Which programs make up Project Reborn, what each one owns, and how they interact when they run alone and when they run together in one process.
timestamp: 2026-11-23T12:00:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [architecture]
---

# Programs

Packages hold the code of each program, and `apps/<name>` is a thin runner around its package.

| Program | Package | Runner | State | Role |
| --- | --- | --- | --- | --- |
| Installer | `packages/installer` | `apps/installer` | built, under `/installer/` | Writes `config.json`, creates the database, the site settings and the first administrator |
| CMS | `packages/cms` | `apps/cms` | being built | The public site |
| Housekeeping | `packages/housekeeping` | `apps/housekeeping` | HK-A built | The staff panel |
| Game server | `packages/server` | `apps/server` | being built, its next work in the [features](/features/index.md); the site's game-server features stay deferred ([0013](/decisions/holo-port/0013-defer-game-server-features.md)) | The hotel itself |
| reborn | `packages/reborn` | `apps/reborn` | built; serves the installer under `/installer/` until the administrator exists ([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)) | Runs all of the above in one process |

# What each program does with shared state

| | `config.json` | Database | Settings |
| --- | --- | --- | --- |
| Installer | Creates it | Creates it and its first rows | Writes once, and is not expected to run again |
| CMS | Reads it, and writes the defaults when it is missing | Reads and writes its own tables | Only reads |
| Housekeeping | Reads it, and writes a release's new keys when an administrator saves them ([0070](/decisions/holo-port/0070-housekeeping-applies-updates.md)) | Reads and writes its own tables, and applies the updates | The single writer ([0040](/decisions/holo-port/0040-housekeeping-writes-settings.md)) |

Nobody is expected to edit the database by hand.

# An empty database

Every program works on an empty database ([0068](/decisions/holo-port/0068-seeds-are-updates.md)).

- A program that finds no database creates it with every update, seeds included, and uses the default values. The
  runners open it with `store.FromConfig()`, which creates it.
- The installer lets the administrator change the default values, the first time Reborn is opened and only once.
- The installer still works on a database another program created, which is how such a hotel gets its administrator.
- `packages/store` is the global access point to the one database, and holds every schema and every update, so a program
  opens tables it never uses.

# Database updates

A release changes the database through update files in `packages/store`.
`packages/store/knowledge/database-updates.md` describes how they work.

- Opening an existing database writes nothing to it. When the CMS or housekeeping starts, it applies only the updates
  that sign-in needs, after a copy ([0071](/decisions/holo-port/0071-sign-in-updates-apply-at-start.md)).
- While other updates wait, the CMS shows maintenance and housekeeping only its update page, where an administrator
  applies them ([0069](/decisions/holo-port/0069-waiting-updates-close-the-hotel.md),
  [0070](/decisions/holo-port/0070-housekeeping-applies-updates.md)).

# Scheduled tasks

`packages/scheduler` is cron-like and lives inside the process ([0043](/decisions/holo-port/0043-scheduler.md)). A program registers its
tasks in its `New`, written as `scheduler.Every(1, scheduler.Hour, task)`.

| Task | Program | Every |
| --- | --- | --- |
| Delete expired reset links ([0044](/decisions/holo-port/0044-expired-reset-links-deleted.md)) | CMS | 1 minute |
| Delete expired sessions ([0050](/decisions/holo-port/0050-expired-sessions-deleted.md)) | CMS, housekeeping | 1 minute |
| Prune the chat history ([0084](/decisions/server/0084-the-game-server-prunes-the-chat-hourly.md)) | Game server | 1 hour |
| Delete ended room bans | Game server | 1 minute |

No task runs while updates wait, because its code may need them.

# Runners

| Program | Production runner | Development runner |
| --- | --- | --- |
| Installer | `apps/installer/cmd/installer` | `apps/installer/cmd/installer-dev` |
| CMS | `apps/cms/cmd/cms` | `apps/cms/cmd/cms-dev` |
| Housekeeping | `apps/housekeeping/cmd/housekeeping` | `apps/housekeeping/cmd/housekeeping-dev` |
| Game server | `apps/server/cmd/server` | `apps/server/cmd/server` |
| reborn | `apps/reborn/cmd/reborn` | `apps/reborn/cmd/reborn-dev` |

- `make dev` in `apps/<app>` starts air from the repository root, so every runner reads and writes the root
  `config.json` ([0027](/decisions/holo-port/0027-runners-run-from-the-root.md)).
- Air rebuilds the runner when a `.go` file of the app, or of a package it imports, changes.

# Web apps: dev and build

The installer, the CMS and housekeeping are web apps, each an Astro frontend in a Go package. They run in two modes.

- **dev**: the development runner starts the Go HTTP server and `make dev` starts the Astro dev server. The Go server
  reverse-proxies HTML and scripts from the Astro dev server (`astro.MakeServerResolver`). Astro hot-reloads page edits,
  and the runner fetches each page on every request, so a frontend change needs no Go restart.
- **build**: Astro build, embed, Go build. The production runner embeds the Astro `dist` output into the Go binary and
  serves it with `astro.MakeFSResolver` and `http.FileServerFS`.
- `go:embed` needs a `dist/index.html` before the first build: `make install` of each frontend writes a placeholder,
  and `tools/create/cmd/create/templates/fullstack/packages/[[name]]/dist/index.html.tmpl` is tracked with
  `git add -f`, because `.gitignore` hides every `dist/`.

# Running alone

This is how programs run today, and how development works.

- Each program has its own process and port, from its runner. The CMS and housekeeping read theirs from `config.json`.
  The game listens on `server.info` and `server.mus`, and serves its `/api/` on `server.api`, 15445 by default.
- Each opens the database named by `config.json` with `store.FromConfig()`.
- Each reads a setting from the database when it uses it, through `packages/settings`, so a change in housekeeping
  reaches every program at the next read, and nothing refreshes
  ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).
- Housekeeping has no sign-in of its own. A guest goes to `site.url`, and the session cookie reaches housekeeping because
  cookies do not depend on the port.
- The CMS's Housekeeping links follow `site.housekeepingUrl`, which the installer asks for. Its default is the development
  address, `http://localhost:18465/housekeeping`.
- Housekeeping keeps uploaded news pictures in the database, and the CMS serves them at `/news/images/{id}.{format}`.
  Housekeeping's previews and its Uploaded Images page load every picture from `site.url`, since it may run on another
  port ([0074](/decisions/holo-port/0074-news-images.md), [0079](/decisions/holo-port/0079-uploaded-images-managed.md)).

- The site and housekeeping call the game's `/api/` on `server.api`, with the hotel's secret read from the database on
  each call (`packages/server/api`, [hotel status](/features/hotel-status/plan.md)).

The programs share the SQLite file, so they run on one machine.

# Running together

`apps/reborn` runs the whole hotel in one process
([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)).

- A hotel with no administrator gets the installer under `/installer/`, and every other page redirects there. In an
  empty folder, reborn first writes `config.json` and creates the database
  ([0004](/decisions/reborn/0004-the-installer-inside-reborn.md)).
- Once the administrator exists, the same server serves the CMS at `/` and housekeeping at `/housekeeping/`, and
  reborn starts the game, with no restart. `/installer/` answers 404.
- One mux listens on `reborn.host` and `reborn.port`, `localhost` and 16416 by default. The game listens on
  `server.info` and `server.mus`. `cms.host`, `cms.port`, `housekeeping.host` and `housekeeping.port` serve only the
  programs run alone.
- The runner owns the HTTP server. `packages/reborn` builds the programs on one database handle and mounts them on the
  mux it receives ([0015](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md)).
- The production runner gives every program the pages and files of reborn's one embedded build (`DistFS`). The
  development runner proxies one Astro dev server ([0009](/decisions/reborn/0009-one-dev-server-for-reborn.md)).
- `Mount` keeps each program's routes protected on the shared mux, and housekeeping stays under `/housekeeping`
  ([0003](/decisions/holo-port/0003-housekeeping-under-prefix.md)).
- The site and housekeeping call the game in the process, through `services.Habbos` and `services.Hotel`. The game
  opens no `/api/`.
- The settings are read from the shared database, as when the programs run alone
  ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).
- On Ctrl-C or SIGTERM, the open requests finish, `Stop` logs each player out, and the database closes. The scheduler's
  tasks run until the process ends ([0016](/decisions/reborn/0016-lifecycle-names-come-in-pairs.md)).

# Comparison

| | Alone | Together |
| --- | --- | --- |
| Processes | One per program | One |
| Ports | One per web program; the game's `info`, `mus` and `api` | One for the web programs; the game's `info` and `mus` |
| The site asks the game | Over the game's `/api/`, with the secret | In the process, through `services` |
| Database handle | One per process | One, shared |
| Session cookie | Shared, on one host | Shared |
| Scheduler | One per process, running that program's tasks | One, running every program's tasks |
| A settings change reaches the CMS | At the next read | At the next read |
