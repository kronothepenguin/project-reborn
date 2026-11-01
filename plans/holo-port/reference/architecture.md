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
| Housekeeping | `packages/housekeeping` | `apps/housekeeping` | planned | The staff panel |
| Game server | `packages/server` | not decided | deferred ([0013](/decisions/0013-defer-game-server-features.md)) | The hotel itself |
| Orchestrator | none | `apps/reborn` | later ([0039](/decisions/0039-orchestrator-is-a-later-project.md)) | Runs all of the above from one binary |

# What each program does with shared state

| | `config.json` | Database | Settings |
| --- | --- | --- | --- |
| Installer | Creates it | Creates it and its first rows | Writes once, and is not expected to run again |
| CMS | Reads it, and writes the defaults when it is missing | Reads and writes its own tables | Only reads |
| Housekeeping | Reads it | Reads and writes its own tables | The single writer ([0040](/decisions/0040-housekeeping-writes-settings.md)) |

Nobody is expected to edit the database by hand.

# Running alone

This is how programs run today, and how development works.

- Each program has its own process and port, from its runner.
- Each opens the database named by `config.json` with `store.FromConfig()`.
- Each holds its own copy of the settings, loaded when it starts (`settings.Load`).
- A settings change in housekeeping reaches the CMS at the CMS's next start. Nothing polls for changes.

The open question is how a running CMS learns of a change. [0040](/decisions/0040-housekeeping-writes-settings.md) expects
IPC between the processes, and its design belongs to [HK-A](/phases/hk-a-housekeeping-core.md).

# Running together

This is planned, and needs the orchestrator.

- One process mounts every program on one mux, with one database handle
  ([0029](/decisions/0029-package-level-settings-and-auth.md)).
- `Mount` keeps each program's routes protected on the shared mux, and housekeeping stays under `/housekeeping`
  ([0003](/decisions/0003-housekeeping-under-prefix.md)).
- The settings are one process-wide singleton, so a change applies at once and the IPC stays disabled.

# Comparison

| | Alone | Together |
| --- | --- | --- |
| Processes | One per program | One |
| Ports | One per program | One |
| Database handle | One per process | One, shared |
| Session cookie | Shared, on one host | Shared |
| Settings copy | One per process | One |
| A settings change reaches the CMS | At its next start; through IPC once it exists | At once |
