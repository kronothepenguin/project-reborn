---
type: Reference
title: How the programs work together
description: Which programs make up Project Reborn, what each one owns, and how they interact when they run alone and when they run together in one process.
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [architecture]
---

# Programs

Packages hold the code of each program, and `apps/<name>` is a thin runner around its package.

| Program | Package | Runner | State | Role |
| --- | --- | --- | --- | --- |
| Installer | `packages/installer` | `apps/installer` | built | Writes `config.json`, creates the database, the site settings and the first administrator |
| CMS | `packages/cms` | `apps/cms` | being built | The public site |
| Housekeeping | `packages/housekeeping` | `apps/housekeeping` | HK-A built | The staff panel |
| Game server | `packages/server` | not decided | deferred ([0013](/decisions/0013-defer-game-server-features.md)) | The hotel itself |
| Orchestrator | none | `apps/reborn` | later ([0039](/decisions/0039-orchestrator-is-a-later-project.md)) | Runs all of the above from one binary |

# What each program does with shared state

| | `config.json` | Database | Settings |
| --- | --- | --- | --- |
| Installer | Creates it | Creates it and its first rows | Writes once, and is not expected to run again |
| CMS | Reads it, and writes the defaults when it is missing | Reads and writes its own tables | Only reads |
| Housekeeping | Reads it | Reads and writes its own tables | The single writer ([0040](/decisions/0040-housekeeping-writes-settings.md)) |

Nobody is expected to edit the database by hand.

# An empty database

Every program works on an empty database ([0049](/decisions/0049-store-is-the-global-database.md)).

- The CMS and housekeeping create it when it does not exist, and use the default values.
- The installer is a merge of every schema and every seed. It lets the administrator change the default values, the first
  time Reborn is opened and only once.
- The installer still works on a database another program created, which is how such a hotel gets its administrator.
- `packages/store` is the global access point to the one database, and holds every schema, so a program opens tables it
  never uses ([0049](/decisions/0049-store-is-the-global-database.md)). A program can have its own seed, which the installer
  merges.

# Scheduled tasks

`packages/scheduler` is cron-like and lives inside the process ([0043](/decisions/0043-scheduler.md)). A program registers its
tasks in its `New`, written as `scheduler.Every(1, scheduler.Hour, task)`.

| Task | Program | Every |
| --- | --- | --- |
| Delete expired reset links ([0044](/decisions/0044-expired-reset-links-deleted.md)) | CMS | 1 minute |
| Delete expired sessions ([0050](/decisions/0050-expired-sessions-deleted.md)) | CMS, housekeeping | 1 minute |

# Running alone

This is how programs run today, and how development works.

- Each program has its own process and port, from its runner. The CMS and housekeeping read theirs from `config.json`.
- Each opens the database named by `config.json` with `store.FromConfig()`.
- Each holds its own copy of the settings, loaded when it starts (`settings.Load`).
- A settings change in housekeeping reaches the CMS at the CMS's next start. Nothing polls for changes, so turning
  maintenance on shows the maintenance page only then.
- Housekeeping has no sign-in of its own. A guest goes to `site.url`, and the session cookie reaches housekeeping because
  cookies do not depend on the port.
- The CMS's Housekeeping links follow `site.housekeepingUrl`, `/housekeeping` by default. Only a shared mux serves that path:
  running alone, the CMS answers 404 there until the setting names housekeeping's own address.

[0051](/decisions/0051-one-machine-and-a-refresh.md) decides how a running CMS learns of a change: it re-reads the settings
every `cms.refresh` seconds, and no IPC is built. [fx-10](/tasks/fx-10-settings-refresh.md) builds it.

# Running together

This is planned, and needs the orchestrator.

- One process mounts every program on one mux, with one database handle
  ([0029](/decisions/0029-package-level-settings-and-auth.md)).
- `Mount` keeps each program's routes protected on the shared mux, and housekeeping stays under `/housekeeping`
  ([0003](/decisions/0003-housekeeping-under-prefix.md)).
- The settings are one process-wide singleton, so a change applies at once and the refresh does not run.

# Comparison

| | Alone | Together |
| --- | --- | --- |
| Processes | One per program | One |
| Ports | One per program | One |
| Database handle | One per process | One, shared |
| Session cookie | Shared, on one host | Shared |
| Settings copy | One per process | One |
| Scheduler | One per process, running that program's tasks | One, running every program's tasks |
| A settings change reaches the CMS | At its next start; within `cms.refresh` seconds after [fx-10](/tasks/fx-10-settings-refresh.md) | At once |
