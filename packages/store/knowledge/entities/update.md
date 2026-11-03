---
type: Entity
title: Update
description: A change to the database that a release brings as an update file, applied once, in version order, and recorded in migrations.
tags: [store, entity, updates]
timestamp: 2026-11-03T21:45:00+00:00
---

# Definition

An update is a file `NNNN-<name>.sql` that a release carries: a schema change, seed data, or both. Its first line is a
`-- ` title, and a `-- automatic` line among its first comments marks an update that sign-in needs. A row of
`migrations` records that a database has it.

# Invariants

- Versions run from 1 without a gap, and a database applies them in that order.
- An update is applied once: its changes and its row commit in one transaction, or neither does.
- Foreign keys are off while an update runs, and `PRAGMA foreign_key_check` must find nothing before its commit.

# Lifecycle

- `ApplyUpdates` applies the waiting updates in order and stops at the first failure, which leaves no trace.
- A program that applies updates to an existing database saves a copy of it first with `Backup`.
- A row is never changed or deleted.

# Vocabularies

None.

# Relations

None: the table records the database itself.

# Tables

- [migrations](/tables/migrations.md)

# Queries

- [migrations.query.sql](/queries/migrations.md)
