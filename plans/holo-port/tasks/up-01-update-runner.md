---
type: Task
title: Apply update files
description: packages/store lists, applies and records update files in order, each in one transaction with a foreign-key check, and saves a copy of the database before a run.
status: todo
phase: up
depends_on: []
packages: [packages/store]
holo: [source/holo/upgrade.php]
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

`packages/store` tells which updates a database lacks and applies them safely
([0067](/decisions/0067-updates-are-our-own-migrations.md)).

# Steps

- [ ] `schema/migrations.schema.sql` declares `migrations` (version, name, applied_at), with
  `queries/migrations.query.sql` and their concepts in `knowledge/`.
- [ ] Update files are read from an `fs.FS`: the name `NNNN-<slug>.sql`, the title on the first line, and the
  `-- automatic` mark. A wrong name, a missing title or a repeated number is an error.
- [ ] The waiting updates are those the files hold and `migrations` lacks, in number order. A database without the table
  has none applied, and reading it writes nothing.
- [ ] Applying follows [Applying updates](/reference/database-updates.md#applying-updates): foreign keys off around each
  transaction, `BEGIN IMMEDIATE`, a skip when another program applied it meanwhile, `PRAGMA foreign_key_check`, the row,
  the commit. The first run creates `migrations` in its transaction, and the first failure stops the run and names the
  update.
- [ ] A copy of the database is saved beside it with `VACUUM INTO`, as `<database>.backup-<YYYYMMDD-HHMMSS>` in UTC.
- [ ] Tests with updates written for them: the order, a failing update that leaves no trace and keeps the ones before
  it, a foreign-key violation that aborts, an update applied meanwhile by another connection, and a copy that opens with
  the same rows.

# Verification

```sh
cd packages/store && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

Breaking these on purpose must fail a test: the order, the transaction around an update, the foreign-key check, the
record, and stopping at the first failure.

# Notes

- No program uses the runner yet; [up-02](/tasks/up-02-baseline.md) gives it the real updates.
