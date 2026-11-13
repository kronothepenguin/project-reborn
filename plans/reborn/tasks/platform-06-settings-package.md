---
type: Task
title: packages/settings reads each setting from the store
description: A new packages/settings holds the list of settings and reads each one with a sqlc query, returning its default when no row exists; auth reads through it; virtual/settings keeps working on top of it until every program has switched.
status: todo
slice: platform
depends_on: []
packages: [packages/settings, packages/store, packages/virtual, packages/auth, packages/cms, packages/housekeeping, packages/installer, packages/server, go.work]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

One way to read settings, from the store, on use ([0006](/decisions/0006-settings-are-read-from-the-store.md)). This is
the slice's contract for settings: it runs alone.

# Steps

- [ ] A new module `packages/settings` (`go work use`). The list of settings with their defaults, checks and the rules
  that tie two together moves there from `packages/virtual/settings/catalogue.go`.
- [ ] `packages/store`: a sqlc query `GetSetting(key)`, its generated code and its OKF document (`adding-data-persistence`,
  `documenting-with-okf`).
- [ ] `settings.String`, `settings.Int` and `settings.Bool(ctx, q *store.Queries, key)`: run `GetSetting`, decode the
  row's JSON, and return the declared default when there is no row or the row is bad (a bad row is logged once, as
  today, never with its value). A key that is not declared is logged and returns the zero value.
- [ ] `settings.Set(ctx, q, userID, key, value)` and `settings.Validate(candidates)`: today's checks and rules, reading
  the other keys of a rule through `q`; the row is deleted when the value is the default, as today. `Declared()` stays.
- [ ] `packages/auth` reads its eight settings through `packages/settings`; the functions that need one take the
  queries they read with, and their callers in the CMS, housekeeping, the installer and the game pass them, the
  transaction's queries inside a transaction.
- [ ] `packages/virtual/settings` keeps its API for the programs that have not switched yet, built on the moved list.
- [ ] Tests: defaults without rows; each type decoded; a bad row gives the default; `Set` validates, writes and deletes;
  a read through a transaction's queries inside a transaction does not wait.
- [ ] `packages/settings/README.md`, with the rule: inside a transaction, read through the transaction's queries.

# Verification

```sh
for m in settings store virtual auth cms housekeeping installer server; do (cd packages/$m && go vet ./... && go test ./... -race); done
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-06`, alone: it touches `go.work`, the store's generated queries and `virtual/settings`.
- A value of `config.json` is read from `config`, not through `settings`.
