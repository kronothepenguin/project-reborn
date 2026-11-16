---
type: Go Package
title: settings
description: The settings held once per process, from config.json and packages/settings, for the programs that do not read packages/settings on use yet.
resource: packages/virtual/settings
---

# What it is

`packages/virtual/settings` holds the settings once per process, for the programs that do not read
`packages/settings` on use yet. It goes once every program has switched
(decision reborn/0006). The list of settings, their checks and how a row is read live in `packages/settings`.

It is filled in this order:

1. every `config.json` value, under the key path of its JSON tags (`cms.port`, `store.path`);
2. every declared setting, as `settings.Declared` reads it from the store, and each secret through `settings.String`.

# Examples

```go
if err := settings.Load(ctx, config.Get(), db); err != nil {
	return err
}

name := settings.GetString("site.name")
idle := settings.GetIntOr("auth.sessionIdleMinutes", 30)

err := settings.Set(ctx, db, userID, "site.maintenance", true)
```

# Functions

- `Load(ctx, cfg, db) error` validates `cfg`, reads the settings and builds the values. It may run again: `cms.New`,
  `housekeeping.New`, `server.New` and the installer run it, so every app of a process loads the same values.
- `GetInt`, `GetBool` and `GetString(key)` return the value. For an unknown key, a value of another type or settings
  not loaded yet, they return the zero value and log a warning with `slog`.
- `GetIntOr`, `GetBoolOr` and `GetStringOr(key, fallback)` return `fallback` in those cases, without a warning.
- `Set(ctx, db, userID, key, value) error` writes one setting with `packages/settings`' `Set`, and the value changes
  at once.
- `Declared() []Setting` lists the declared settings with their current values, sorted by key, for housekeeping's
  forms. A secret comes without its value, and `GetString` is the only way to read it.
- `Reload(ctx, db) error` reads the settings again. `cms.New` and `server.New` run it every `cms.refresh` seconds, so a
  program running apart from housekeeping learns of a change.
- `Set` and `Reload` before any `Load` return an error.

# Gotchas

- The store's pool has one connection, so calling `Load`, `Set` or `Reload` while holding a transaction blocks
  forever.
