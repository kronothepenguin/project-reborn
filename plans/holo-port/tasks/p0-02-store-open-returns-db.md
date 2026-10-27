---
type: Task
title: Make store.Open return *sql.DB
description: Remove the Store wrapper so store.Open and store.Must return *sql.DB, and add the sqlite time format to the connection string.
status: done
phase: p0
depends_on: []
packages: [packages/store]
holo: []
timestamp: 2026-10-27T21:06:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:06:14+00:00"}
---

# Goal

Apply [0011](/decisions/0011-store-returns-sql-db.md) and the time format of
[0012](/decisions/0012-sqlite-native-types.md) to `packages/store`.

# Steps

- [x] `packages/store/store.go`: `func Open(path string) (*sql.DB, error)` keeps `foreign_keys(1)`, WAL,
      `busy_timeout(5000)`, `SetMaxOpenConns(1)`/`SetMaxIdleConns(1)` and `applySchemas`, and adds
      `_time_format=sqlite` to the DSN.
- [x] `func Must(db *sql.DB, err error) *sql.DB`; remove the `Store` struct and `Close`.
- [x] Update `store_test.go` and `errors_test.go` to the new API.
- [x] `packages/store/knowledge/store.md`: remove `Store` and `Begin`; show `Open` + `store.New(db)`; show a
      transaction with `db.BeginTx` + `q.WithTx(tx)`; note that inside a transaction only the transaction's queries
      may be used because the pool has one connection.
- [x] `grep -rn "store.Open\|\*store.Store" --include=*.go .` from the repository root finds no other caller left
      on the old API.

# Verification

```sh
cd packages/store && gofmt -l . && go vet ./... && go test ./... -race && make check-docs
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go'
```

Results (2026-10-27T21:06:14+00:00):

- `gofmt -l .` and `go vet ./...`: no output.
- `go test ./... -race -count=1`: `ok github.com/kronothepenguin/project-reborn/packages/store`. The ten tests pass,
  including the new `TestOpenWritesSQLiteTimeFormat` (stored text `2026-10-27 21:01:41.5+00:00`, read back as the
  same instant) and `TestQueriesRunInsideATransaction` (`New(db).WithTx(tx)`).
- `make check-docs`: exit 0.
- Regenerating with sqlc leaves `db.go`, `models.go` and `ping.query.sql.go` unchanged. The `git diff` is limited
  to the generated files because this task's own edits are not committed yet.
- No Go file outside `packages/store` uses `store.Store`, `*Store` or `Begin`.

# Notes

- `TestCloseIdempotent` was removed: closing is now `(*sql.DB).Close` from the standard library, not store code.
  `TestOperationsAfterCloseFailClearly` stays, now calling `New(db).Ping` on a closed database.
- `knowledge/index.md` repeats the new description of `knowledge/store.md`; `knowledge/queries/ping.md` shows the
  new API.
- Still describing the old API until [p0-03](/tasks/p0-03-persistence-skill-updates.md): step 6 of
  `.agents/skills/adding-data-persistence/SKILL.md` (`store.Open(path)` returning a store, `(*Store).Begin`).
- Found, not changed: `packages/store/testdata/schema/alpha.schema.sql` and `beta.schema.sql` are not referenced by
  any Go file. Removing them or using them in a test is the user's call.
