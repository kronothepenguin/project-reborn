---
type: Task
title: Start the updates from a baseline
description: 0001-baseline.sql holds today's schema, Open creates a new database with every update and leaves an existing one alone, and a test keeps the schema files and the updates alike.
status: todo
phase: up
depends_on: [up-01]
packages: [packages/store, .agents/skills/adding-data-persistence, .agents/skills/documenting-with-okf]
holo: []
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

The schema files and the updates describe the same database, and opening a database writes to it only when it is new.

# Steps

- [ ] `migrations/0001-baseline.sql` holds the schema files as they are, with `IF NOT EXISTS`, embedded in the package.
- [ ] `Open` creates a database that has no table with every update at once, and no longer applies the schema files to an
  existing database.
- [ ] A test builds one database from the schema files and one from the updates, and compares their tables, columns (type,
  not null, default, primary key), indexes (columns, unique, partial) and foreign keys.
- [ ] A test opens a database made the way `Open` made them before updates, and finds every update waiting and its rows
  untouched.
- [ ] `knowledge/store.md` describes updates instead of additive schemas, every update file has a concept, and
  `make check-docs` requires it.
- [ ] The `adding-data-persistence` skill teaches [Writing an update](/reference/database-updates.md#writing-an-update),
  and the `documenting-with-okf` skill the update concept.

# Verification

```sh
cd packages/store && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
cd packages/store && go tool sqlc generate && git diff --exit-code
# go test -race in every module that opens a database
```

Breaking these on purpose must fail a test: a column added to a schema file without an update, an update without the
schema file, and `Open` writing to an existing database.

# Notes

- Columns are compared by name, because `ALTER TABLE ... ADD COLUMN` always adds a column last.
- CHECK constraints live only in the text of `CREATE TABLE`, which `ALTER TABLE` edits, so the test reads them from that
  text.
- Until [up-06](/tasks/up-06-close-while-waiting.md), the programs run on a database with waiting updates as they do
  today. Nothing changes for them, because `0001` matches the schema they already have.
