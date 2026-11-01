---
type: Decision
title: Every program works on an empty database
description: Any program creates and uses an empty database with default values, while the installer merges every schema and seed and lets the administrator change the defaults once.
status: accepted
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
tags: [installer, store, architecture]
---

# Decision

- Every program works on an empty database. The CMS and housekeeping create it when it does not exist, and use the default
  values.
- The installer is a merge of every schema and every seed. It lets the administrator change the default values, the first
  time Reborn is opened and only once.
- The CMS and housekeeping can have their own set of schema and seed.
- The rest of [0016](/decisions/0016-installer.md) stands: the wizard's steps, and refusing to run once an administrator
  exists.

# Context

Supersedes [0016](/decisions/0016-installer.md), whose consequence had the CMS and housekeeping refuse to start when the
database file is missing, and whose home store seed belonged to the installer alone. Since
[0029](/decisions/0029-package-level-settings-and-auth.md) the CMS already creates an empty database. The user answered: "i
think housekeeping can create its own empty one as well, btw, every empty db should work. installer is merely a merge of
every schema + every seed. but cms or hk could have their own set of schema + seed. installer allows the admin to modify
default values the first ever time reborn is opened and only once, the other project will just use the default values if
database does not exists."

# Consequences

- The home store seed of [P3](/phases/p3-homes.md) belongs to the program that uses it, and the installer merges it.
- Today `packages/store` applies every schema to every database. Splitting them per program is possible, and waits until
  a program needs it.
- An empty database has no administrator until the installer creates one, so the installer must still work on a database
  another program created.
