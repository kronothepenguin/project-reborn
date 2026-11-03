---
type: Task
title: Apply update files
description: packages/store lists, applies and records update files in order, each in one transaction with a foreign-key check, and saves a copy of the database before a run.
status: done
phase: up
depends_on: []
packages: [packages/store]
holo: [source/holo/upgrade.php]
timestamp: 2026-11-03T21:38:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:38:45+00:00"}
---

# Goal

`packages/store` tells which updates a database lacks and applies them safely
([0067](/decisions/0067-updates-are-our-own-migrations.md)).

# Steps

- [x] `schema/migrations.schema.sql` declares `migrations` (version, name, applied_at), with
  `queries/migrations.query.sql` and their concepts in `knowledge/`.
- [x] Update files are read from an `fs.FS`: the name `NNNN-<slug>.sql`, the title on the first line, and the
  `-- automatic` mark. A wrong name, a missing title or a repeated number is an error.
- [x] The waiting updates are those the files hold and `migrations` lacks, in number order. A database without the table
  has none applied, and reading it writes nothing.
- [x] Applying follows [Applying updates](/reference/database-updates.md#applying-updates): foreign keys off around each
  transaction, `BEGIN IMMEDIATE`, a skip when another program applied it meanwhile, `PRAGMA foreign_key_check`, the row,
  the commit. The first run creates `migrations` in its transaction, and the first failure stops the run and names the
  update.
- [x] A copy of the database is saved beside it with `VACUUM INTO`, as `<database>.backup-<YYYYMMDD-HHMMSS>` in UTC.
- [x] Tests with updates written for them: the order, a failing update that leaves no trace and keeps the ones before
  it, a foreign-key violation that aborts, an update applied meanwhile by another connection, and a copy that opens with
  the same rows.

# Verification

```sh
cd packages/store && gofmt -l . && go vet ./... && go test -race ./... && make check-docs
```

Breaking these on purpose must fail a test: the order, the transaction around an update, the foreign-key check, the
record, and stopping at the first failure.

Results (2026-11-03T21:38:45+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `make check-docs` passes, and `go tool sqlc diff` finds
  nothing to regenerate.
- `go vet` and `go test -race` pass in `packages/auth`, `packages/virtual`, `packages/cms`, `packages/housekeeping` and
  `packages/installer`, which open their databases through `Open`.
- The tests cover the order, a failure that leaves no trace and stops the run, a foreign-key violation, a table rebuild
  that other tables refer to, an update applied meanwhile by another connection or held up by another program's write
  lock, three programs updating together, reading without writing, and the copies.
- Breaking these on purpose fails a test: applying or listing in reverse, a plain `BEGIN`, committing a failed update, no
  foreign-key check, foreign keys left on or off, no record, a wrong name, no skip, going on after a failure, the usual
  busy timeout, a waiting list that writes, the copy's place, its time and its second name, and a gap in the versions.

# Notes

- No program uses the runner yet; [up-02](/tasks/up-02-baseline.md) gives it the real updates.
- `Open` still applies the schema files, so it also creates the empty `migrations` table until
  [up-02](/tasks/up-02-baseline.md) changes it.
- `BEGIN IMMEDIATE` keeps two programs from both finding an update waiting. The test that holds the write lock from
  another connection is the one that tells it from a plain `BEGIN`; three programs updating together did not.
- `Backup` relies on `VACUUM INTO` refusing a file that exists, and tries `-2` to `-10` only when the name it chose is
  taken.
