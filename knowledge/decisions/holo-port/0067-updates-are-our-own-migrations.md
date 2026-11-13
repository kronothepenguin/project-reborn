---
type: Decision
title: Database updates are our own migrations
description: packages/store applies numbered SQL update files in order, each in one transaction with its record and a foreign-key check, after saving a copy of the database, and the schema files stay beside them.
status: accepted
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
tags: [store, updates]
---

# Decision

- A release's database changes are update files, `packages/store/migrations/NNNN-<slug>.sql`, applied in number order
  and embedded in every program. A `migrations` table records each applied update with its version, name and time.
- The runner is our own code in `packages/store`, with no migration library.
- Each update runs in one transaction together with its record. Foreign keys are off around the transaction, as SQLite
  needs when it rebuilds a table, and `PRAGMA foreign_key_check` must find nothing before the commit.
- One action applies every waiting update in order. The first failure stops it: the failed update leaves no trace, and
  the ones before it stay. Updates are never picked out of order.
- Before an existing database is updated, a copy is saved beside it with `VACUUM INTO`. Updates only go forward, and
  undoing one means putting the copy back.
- The schema files in `packages/store/schema/` stay the picture of the current database, for sqlc and the docs. A change
  is written in its schema file and as a new update, and a test fails when a database built from the schema files differs
  from one built from the updates.

# Context

Every program applies the schema files with `CREATE TABLE IF NOT EXISTS` when it opens the database. A new table reaches
an existing database that way, but a changed table or a new seed never does, so P3 ended with "recreate the database".
The user asked: "i would like to have the option in the installer to detect if there is something new to add, like
modify the schema or new seeds. also the config.json itself. i want to allow the installer to update the database so it
does not needs to be created every time something gets updated. i'm open to discuss about possible existing migration
systems or create our own migration system for the database."

Offered goose, golang-migrate and a runner of our own, the user chose "Our own runner". Goose runs a table rebuild
outside its transaction, apart from its record, and golang-migrate's table cannot list the waiting updates by name. The
user then chose "All, in order", "Copy first" and, for the schema files, "Keep both".

Holo's `upgrade.php` was one button that ran the changes since the last release, with no record of what had run.

# Consequences

- The additive-only rule of `packages/store/knowledge/store.md` and of the `adding-data-persistence` skill gives way to
  update files.
- [How database updates work](/reference/database-updates.md) describes the files, the runner and the rules for writing
  an update, and [UP Database updates](/phases/up-database-updates.md) builds them.
