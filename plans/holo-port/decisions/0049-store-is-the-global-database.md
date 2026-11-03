---
type: Decision
title: packages/store is the global database
description: packages/store stays the one access point to one global database with every schema, and programs do not get schemas of their own.
status: superseded
superseded_by: "0068"
timestamp: 2026-11-01T20:49:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:49:31+00:00"}
tags: [store, architecture]
---

# Decision

- `packages/store` is the global access point to the one database, and it holds every schema. Programs do not get schemas
  of their own, and it does not matter that a program opens tables it never uses.
- The rest of [0047](/decisions/0047-every-program-works-on-an-empty-database.md) stands:
  - every program works on an empty database, creating it when it does not exist and using the default values;
  - the installer lets the administrator change the default values, the first time Reborn is opened and only once;
  - seeds belong to the program that uses them, and the installer merges them.

# Context

Supersedes [0047](/decisions/0047-every-program-works-on-an-empty-database.md), which allowed each program its own set of
schema. Told that the schemas were not split, the user answered: "`packages/store` is aim to have the global database, not
split by apps, i forgot this, so keep `packages/store` as the global access point for the database, it does not matter if it
has every schema."

# Consequences

- The database is not split by program, now or later.
