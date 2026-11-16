---
type: Task
title: Read each setting from the store in packages/settings
description: A new packages/settings holds the list of settings and reads each one with a sqlc query, returning its default when no row exists; auth reads through it; virtual/settings keeps working on top of it until every program has switched.
scope: [packages/settings, packages/store, packages/virtual, packages/auth, packages/cms, packages/housekeeping, packages/installer, packages/server, go.work]
depends_on: []
skills: [applying-go-patterns, adding-data-persistence, testing-behaviours, documenting-with-okf, use-modern-go]
---

# Goal

One way to read settings, from the store, on use ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).
This is the feature's contract for settings: it runs alone. The behaviours:

- Staff save a setting: the next read in any program returns it, with no wait for a refresh. (platform)
- A hotel without setting rows: every setting holds its default. (hotel-settings)
- A stored setting holds a bad value, a key nothing declares, or a `config.json` key: it is ignored, the default or the
  config value applies, and the log names it once per reason. (hotel-settings)
- Stored settings break a rule together: those rows go back to their defaults, and the log names them.
  (hotel-settings)

The tests that prove the hotel-settings lines today sit in `packages/virtual/settings`: they move with the list.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- `packages/store/knowledge/adding-persisted-data.md`: the playbook of `adding-data-persistence`.
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md)
- Runs alone: it touches `go.work`, the store's generated queries and `virtual/settings`, and the callers of
  `packages/auth` in the CMS, housekeeping, the installer and the game. The master starts it when no other task is
  open in those packages.
- [Hotel settings](/features/hotel-settings/spec.md): the lines the moved tests prove.
- `packages/virtual/knowledge/settings.md`: the list as it is today. A new hotel is named "Reborn Hotel", and
  `TestANewHotelIsNamedReborn` moves with the list.
- A value of `config.json` is read from `config`, not through `settings`.

# Steps

- [ ] A new module `packages/settings` (`go work use`). The list of settings with their defaults, checks and the rules
  that tie two together moves there from `packages/virtual/settings/catalogue.go`.
- [ ] `packages/store`: a sqlc query `GetSetting(key)` and its generated code (`adding-data-persistence`). The
  `settings` table is in `packages/store/knowledge/tables.md` already.
- [ ] `settings.String`, `settings.Int` and `settings.Bool(ctx, q *store.Queries, key)`: run `GetSetting`, decode the
  row's JSON, and return the declared default when there is no row or the row is bad (a bad row is logged once, as
  today, never with its value). A key that is not declared is logged and returns the zero value.
- [ ] `settings.Set(ctx, q, userID, key, value)` and `settings.Validate(candidates)`: today's checks and rules, reading
  the other keys of a rule through `q`; the row is deleted when the value is the default, as today. `Declared()` stays.
- [ ] `packages/auth` reads its eight settings through `packages/settings`; the functions that need one take the
  queries they read with, and their callers in the CMS, housekeeping, the installer and the game pass them, the
  transaction's queries inside a transaction.
- [ ] `packages/virtual/settings` keeps its API for the programs that have not switched yet, built on the moved list.
- [ ] One test per behaviour of the goal. The tests of the moved list keep proving their lines; a test of a detail
  stays behind.
- [ ] A short `packages/settings/README.md` (what it is, setup), a `Makefile` that includes the shared check recipe,
  and in `packages/settings/knowledge/` what the package is and the rule: inside a transaction, read through the
  transaction's queries.

# Checks

```sh
make -C packages/settings check
make -C packages/store check
make -C packages/virtual check
make -C packages/auth check
make -C packages/cms check
make -C packages/housekeeping check
make -C packages/installer check
make -C packages/server check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/settings`,
`packages/store`, `packages/virtual`, `packages/auth`, `packages/cms`, `packages/housekeeping`, `packages/installer`,
`packages/server`.
