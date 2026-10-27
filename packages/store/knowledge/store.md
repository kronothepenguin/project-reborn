---
type: Go Package
title: Store
description: Persistence infrastructure that opens the SQLite file, applies the declared schemas and provides the generated typed operations.
resource: packages/store
tags: [store, sqlite, go]
timestamp: 2026-10-27T21:01:41+00:00
---

# Overview

`packages/store` is the project's persistence infrastructure. `Open` returns a
`*sql.DB` for the deployment's SQLite file after applying every declared
schema, and the sqlc-generated `New` binds the typed operations from
`packages/store/queries/` to that database or to a transaction. It owns no
domain tables: features contribute schema and query files incrementally.

# API

| Function | Behaviour |
|----------|-----------|
| `Open(path string) (*sql.DB, error)` | Opens the SQLite file (creating it when missing) and applies the embedded schemas. |
| `Must(db *sql.DB, err error) *sql.DB` | Returns `db`, or panics with `err`, like `template.Must`. |
| `New(db DBTX) *Queries` | Generated; binds the typed operations to a `*sql.DB` or a `*sql.Tx`. |
| `(*Queries).WithTx(tx *sql.Tx) *Queries` | Generated; the same operations inside a transaction. |
| `IsNotFound`, `IsConflict`, `IsForeignKey`, `IsBusy` | Classify the errors the operations return. |

# Guarantees

- **Single owner.** Applications open the database with `store.Open` and run
  SQL only through generated operations; they never import a driver, call
  `sql.Open`, or execute ad-hoc SQL.
- **Always-on integrity and journaling.** Every connection enables
  `foreign_keys`, `journal_mode=WAL`, and a five second busy timeout; the pool
  is capped at one connection per process.
- **SQLite time format.** `time.Time` values are written as
  `2006-01-02 15:04:05.999999999-07:00` (`_time_format=sqlite`), and `DATE`,
  `DATETIME` and `TIMESTAMP` columns read back as `time.Time`.
- **Multi-application safety.** Several connections and processes may share one
  database file. Readers see committed data only; conflicting writers wait up
  to the busy timeout, then fail with a busy error for which `IsBusy` is true.
  A failed write never leaves a partial change behind.
- **Additive evolution.** Schema files are applied in lexicographic filename
  order and use idempotent, additive DDL. The store never drops, alters, or
  overwrites structures it does not declare, so an older application can open
  a database created by a newer one and leave unknown structures untouched.
- **Atomic units of work.** A transaction started with `db.BeginTx` makes its
  changes visible only on `Commit`; a process exit before commit leaves no
  partial change.
- **Classified failures.** Consumers classify raw errors with
  `IsNotFound`, `IsConflict`, `IsForeignKey`, and `IsBusy`.

# Gotchas

- The pool has one connection. Inside a transaction use only the queries bound
  to it (`q.WithTx(tx)`); calling `db` or an unbound `Queries` there waits
  forever for the connection the transaction holds.
- Pass times from Go as UTC `time.Time` and never use `CURRENT_TIMESTAMP`: its
  `YYYY-MM-DD HH:MM:SS` text has no offset, so it does not compare correctly
  with the stored format.

# Operations

Typed operations are generated from the files under `packages/store/queries/`:
the [`Ping`](/queries/ping.md) smoke query and every future feature operation.
Regenerate with `go tool sqlc generate` after changing SQL; generated files are
committed and never edited by hand.

# Examples

```go
db, err := store.Open("habbo.db")
if err != nil {
    return err
}
defer db.Close()

q := store.New(db)
if _, err := q.Ping(ctx); err != nil {
    return err
}
```

Several writes that must succeed together:

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil {
    return err
}
defer tx.Rollback()

qtx := q.WithTx(tx)
// every write of the unit goes through qtx

return tx.Commit()
```

# Citations

1. [modernc.org/sqlite](https://pkg.go.dev/modernc.org/sqlite)
2. [SQLite write-ahead logging](https://www.sqlite.org/wal.html)
3. [sqlc documentation](https://docs.sqlc.dev/en/latest/)
4. [database/sql transactions](https://pkg.go.dev/database/sql#Tx)
