---
type: Decision
title: The game server loads the settings and reloads them like the CMS
description: server.New loads the settings, panicking when it cannot, and reloads them every cms.refresh seconds while no update waits, as cms.New does.
status: accepted
timestamp: 2026-11-10T02:18:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:18:18+00:00"}
tags: [server, settings]
---

# Decision

- `server.New(db)` loads the settings from `config.json` and the database, and panics when it cannot, as `cms.New`
  does.
- It reloads them every `cms.refresh` seconds while no database update waits, as the CMS does, so that a change in
  housekeeping's Game form reaches a server running alone within seconds.

# Context

The version check and 257 read settings (`game.clientVersion`, `site.url` and the ten `game.` parameters of
[0034](/decisions/0034-session-parameters-are-settings.md)), and `packages/server` never loaded them. Offered loading
them once in `server.New`, or loading and reloading them, the user chose "Load and reload": "server.New loads them and
also reloads them every cms.refresh seconds, as the CMS does, so a change in housekeeping's Game form reaches a server
running alone within seconds."

# Consequences

- [s2-06](/tasks/s2-06-handshake-and-login.md) applies it. The tests of `packages/server` open a database of their own.
