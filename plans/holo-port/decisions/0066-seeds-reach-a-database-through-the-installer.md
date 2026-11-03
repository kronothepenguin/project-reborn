---
type: Decision
title: Seeds reach a database through the installer alone
description: The home store's seed belongs to the CMS and only the installer writes it, so a database installed before a seed existed is recreated.
status: superseded
superseded_by: "0068"
timestamp: 2026-11-03T17:26:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:05+00:00"}
tags: [installer, store, homes]
---

# Decision

- The home store's seed belongs to the CMS, as [0049](/decisions/0049-store-is-the-global-database.md) says, and only
  the installer writes it, when it installs.
- A database installed before a seed existed is recreated with the installer. The CMS never writes seeds.

# Context

The development database was installed before the home store existed, so its store would be empty. Offered to have the CMS
fill an empty store when it starts, the user chose "Recreate the database".

# Consequences

- After [P3](/phases/p3-homes.md) the development database is recreated, and its administrator with it.
