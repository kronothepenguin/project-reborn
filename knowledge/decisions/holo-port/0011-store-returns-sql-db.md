---
type: Decision
title: store.Open returns *sql.DB
description: The Store wrapper is removed; store.Open returns *sql.DB and callers run the sqlc queries on a db or a transaction.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [store]
---

# Decision

- `func Open(path string) (*sql.DB, error)` and `func Must(db *sql.DB, err error) *sql.DB`.
- `Open` keeps `foreign_keys(1)`, WAL, `busy_timeout(5000)` and a single connection, adds `_time_format=sqlite`,
  and applies the embedded schema files.
- Callers use `store.New(db)`. A multi-step write uses `db.BeginTx` and `q.WithTx(tx)`.
- `IsNotFound`, `IsConflict`, `IsForeignKey` and `IsBusy` stay.

# Context

The `Store` struct only embedded `*Queries` and hid the `*sql.DB`. `(*Store).Begin`, described in
`packages/store/knowledge/store.md` and in `adding-data-persistence`, never existed.

# Consequences

- With one connection, code inside a transaction must only use the transaction's queries; touching `db` there
  blocks forever.
- `knowledge/store.md` and the skill are corrected ([p0-02](/tasks/p0-02-store-open-returns-db.md),
  [p0-03](/tasks/p0-03-persistence-skill-updates.md)).
