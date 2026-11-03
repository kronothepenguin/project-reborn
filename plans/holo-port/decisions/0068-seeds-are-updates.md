---
type: Decision
title: Seeds are updates, and a new database gets every update
description: Seed data lives in packages/store as update files beside the schema changes, and a program that creates a database applies every update to it, seeds included.
status: accepted
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [store, updates, installer]
---

# Decision

- Seeds are update files in `packages/store/migrations/`, in the same ordered list as the schema changes: Holo's home
  store, and Holo's ranks as access groups. The installer and the CMS stop writing them in Go.
- A program that finds no database, or one with no table, creates it with every update at once, seeds included, so a new
  database is complete from the start and nothing waits.
- An existing database changes only through updates ([0069](/decisions/0069-waiting-updates-close-the-hotel.md),
  [0071](/decisions/0071-sign-in-updates-apply-at-start.md)).
- `seed.Art()`, the list of the art in the repository, and the store's category ids stay in `packages/cms/seed`: they are
  not database rows.
- The rest of [0049](/decisions/0049-store-is-the-global-database.md) stands: `packages/store` is the global access point
  to the one database and holds every schema, every program works on an empty database, and the installer lets the
  administrator change the default values the first time Reborn is opened, and only once.

# Context

Supersedes [0049](/decisions/0049-store-is-the-global-database.md), where seeds belonged to the program that used them and
the installer merged them, and [0066](/decisions/0066-seeds-reach-a-database-through-the-installer.md), where only the
installer wrote seeds and a database installed before a seed existed was recreated. The user asked for "the schema or
seeds as migrations", chose "packages/store" for the seeds, and chose "Every update" for a new database.

# Consequences

- A hotel installed before P3 receives Holo's home store through an update instead of being recreated.
- Every program reads the same list of updates, so what is waiting is the same everywhere.
- Every new database, test databases included, holds the home store and the ranks.
