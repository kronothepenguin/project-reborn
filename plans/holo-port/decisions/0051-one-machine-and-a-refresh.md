---
type: Decision
title: One machine, and a refresh instead of IPC
description: The programs run on one machine while the database is SQLite, and a CMS running alone re-reads the settings every cms.refresh seconds, so no IPC is built.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [settings, architecture, store]
---

# Decision

- SQLite stays, and the programs run on one machine.
- A CMS running alone re-reads the settings from the database every `cms.refresh` seconds, on the scheduler.
- No IPC is built. Housekeeping has no refresh, because it is the single writer, and in one process with the
  orchestrator the refresh does not run.
- The rest of [0040](/decisions/0040-housekeeping-writes-settings.md) stands: housekeeping is the single writer of
  settings, the installer writes them once and the CMS only reads them.

# Context

Supersedes [0040](/decisions/0040-housekeeping-writes-settings.md), which left the IPC open. The user asked for UDP
broadcast and for programs on different servers. SQLite's documentation says "All processes using a database must be on
the same host computer; WAL does not work over a network filesystem", and AWS, Google and Azure document that their
private networks carry no broadcast. Told that, the user answered: "sqlite as recommended" and "go with a, a refresh
that verifies the database on schedule `cms.refresh`".

# Consequences

- `cms.refresh` gets its reader and a form, and a change reaches a running CMS within that many seconds.
- Running on different machines needs a database server first. All SQL stays in `packages/store`, so that change stays
  contained.
- Commands for the game server, such as a kick, need a reliable channel, which is designed with the game server.
