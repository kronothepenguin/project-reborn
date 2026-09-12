# Quickstart Validation: Central Store Library

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

How to prove the store works end to end after implementation. Commands run from `packages/store` unless stated otherwise. Expected outcomes are listed per scenario; contracts live in `contracts/`.

## Prerequisites

- Go 1.27 workspace with `packages/store` registered in `go.work` (`go work use ./packages/store`).
- `packages/store` builds with CGO disabled.

## 1. Build and unit gates

```sh
cd packages/store
go build ./...
go vet ./...
go test ./... -race
```

Expected: all pass. This covers the API contract in `contracts/library-api.md` (open/close, schema application, error helpers, transactions).

## 2. Pragmas are always on

```sh
go test ./... -run TestOpenAppliesPragmas -v
```

Expected: the test opens a temp-file store and asserts `PRAGMA foreign_keys` = 1 and `PRAGMA journal_mode` = `wal`; it also asserts a foreign-key violation is reported by `IsForeignKey`.

## 3. Schema application is idempotent and additive

```sh
go test ./... -run 'TestReopen|TestAdditiveChange|TestOlderVersionCoexists|TestExtension|TestUnknownTable|TestAllDeclared' -v
```

Expected: opening a fresh file applies the declared schemas; opening the same file again is a no-op; a database containing an unknown table is untouched by the store; fixture schemas from `testdata/` apply in filename order. See `data-model.md` §File Artifacts.

## 4. Transactions are atomic

```sh
go test ./... -run TestTransaction -v
```

Expected: committing a unit makes all changes visible; a failure mid-unit leaves none of its changes; rollback after commit and commit after rollback return errors.

## 5. Two processes share one file safely

```sh
go test ./... -run TestBusyAcrossProcesses -v
```

Expected: a helper subprocess holds a write transaction while the main process attempts a conflicting write; the second write either waits and succeeds within the busy timeout, or fails with an error for which `IsBusy` is true. No corruption, no partial data.

## 6. Generated code is in sync

```sh
cd packages/store
go tool sqlc generate
git diff --exit-code
```

Expected: no output, exit 0. Generated files (`db.go`, `models.go`, `*.query.sql.go`) are committed and never hand-edited. `queries/ping.query.sql` documents the initial `Ping` operation.

## 7. OKF documentation conforms

```sh
cd packages/store
find knowledge -name '*.md' ! -name 'index.md' ! -name 'log.md' | while read -r f; do
  grep -q '^type:' "$f" || echo "missing type: $f"
done
for f in schema/*.schema.sql queries/*.query.sql; do
  grep -rl "resource:.*$f" knowledge >/dev/null || echo "undocumented: $f"
done
```

Expected: no `missing type` or `undocumented` lines. The bundle follows `contracts/knowledge-bundle.md`; `knowledge/index.md` lists every concept and declares `okf_version: "0.2"`.

## 8. Skills drive a real contribution

1. Ask a fresh agent/contributor to add a trivial table plus one read and one write operation using only `.agents/skills/adding-data-persistence/SKILL.md`.
2. Expected: new `schema/<feature>.schema.sql` and `queries/<feature>.query.sql` exist; they follow `contracts/sql-conventions.md`; concepts exist in `knowledge/`; the index lists them; `go tool sqlc generate` succeeds; the generated operations compile; `go test ./...` passes; documentation checks in scenario 7 return clean.
3. The skill references `.agents/skills/documenting-with-okf/SKILL.md` instead of duplicating OKF rules.

Recorded exercise (2026-09-12): the `adding-data-persistence` skill was followed
on a scratch copy at `/tmp/opencode/store-skill-check` (feature `scratch`: one
table, one write and two read operations, concepts and index entries, generated
code, a consuming test). Result: all steps completed without outside context in
68 seconds, well within the SC-002 15-minute budget; `go vet ./...`,
`go test ./...`, `make check-docs`, and a regeneration `git diff --exit-code`
all passed. No skill changes were needed and no scratch files were committed.

## 9. Optional: opening a nonexistent/deleted database

```sh
go test ./... -run TestOpenCorruptOrUnwritable -v
```

Expected: a missing parent directory, an unwritable path, and a non-database file each return an error naming the path; the invalid file is not deleted or overwritten (`contracts/library-api.md`).
