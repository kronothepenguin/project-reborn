---
type: Task
title: Start the updates from a baseline
description: 0001-baseline.sql holds today's schema, Open creates a new database with every update and leaves an existing one alone, and a test keeps the schema files and the updates alike.
status: done
phase: up
depends_on: [up-01]
packages: [packages/store, .agents/skills/adding-data-persistence, .agents/skills/documenting-with-okf]
holo: []
timestamp: 2026-11-03T21:50:06+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:50:06+00:00"}
---

# Goal

The schema files and the updates describe the same database, and opening a database writes to it only when it is new.

# Steps

- [x] `migrations/0001-baseline.sql` holds the schema files as they are, with `IF NOT EXISTS`, embedded in the package.
- [x] `Open` creates a database that has no table with every update at once, and no longer applies the schema files to an
  existing database.
- [x] A test builds one database from the schema files and one from the updates, and compares their tables, columns (type,
  not null, default, primary key), indexes (columns, unique, partial) and foreign keys.
- [x] A test opens a database made the way `Open` made them before updates, and finds every update waiting and its rows
  untouched.
- [x] `knowledge/store.md` describes updates instead of additive schemas, every update file has a concept, and
  `make check-docs` requires it.
- [x] The `adding-data-persistence` skill teaches [Writing an update](/reference/database-updates.md#writing-an-update),
  and the `documenting-with-okf` skill the update concept.

# Verification

```sh
cd packages/store && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
cd packages/store && go tool sqlc generate && git diff --exit-code
# go test -race in every module that opens a database
```

Breaking these on purpose must fail a test: a column added to a schema file without an update, an update without the
schema file, and `Open` writing to an existing database.

Results (2026-11-03T21:50:06+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/virtual`, `packages/cms`,
  `packages/housekeeping`, `packages/installer`, `packages/config` and `packages/scheduler`.
- `make check-docs` passes and now requires a concept for every update file, and `go tool sqlc diff` finds nothing to
  regenerate.
- `pnpm test together signed-out` passes all 91 checks on the production binaries, on a hotel the installer created
  through the updates.
- Breaking these on purpose fails a test: a schema file that gains a column, changes a check or gains an index without
  an update, an update without its schema change, and `Open` writing to an existing database or leaving a new one empty.
  An update together with its schema change passes every test.

# Notes

- Columns are compared by name, because `ALTER TABLE ... ADD COLUMN` always adds a column last.
- CHECK constraints live only in the text of `CREATE TABLE`, which `ALTER TABLE` edits, so the test reads them from that
  text.
- Until [up-06](/tasks/up-06-close-while-waiting.md), the programs run on a database with waiting updates as they do
  today. Nothing changes for them, because `0001` matches the schema they already have.
- `schema.go` is gone: only the tests read the schema files now, from `schema_files_test.go`.
- The comparison reads columns, table constraints and indexes from the text SQLite keeps, matching columns by name. A
  test checks that it tells apart an added column, index, partial index, check, default, collation, foreign-key action,
  missing index and added table, and ignores spaces, comments and where a column sits.
- The test of a database made before updates builds it from `0001-baseline.sql`, because later updates change the schema
  files.
