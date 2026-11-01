# virtual

In-memory state of Project Reborn's entities, one package per entity. Nothing here keeps a database connection: every function that reads or writes the database receives the `*sql.DB`, and the program that opened it stays its owner.

## settings

`packages/virtual/settings` holds the settings once per process, filled in this order:

1. the defaults declared in the catalogue (`settings/catalogue.go`);
2. every `config.json` value, under the key path of its JSON tags (`cms.port`, `store.path`);
3. the rows of the `settings` table, whose `value` is a JSON literal of the setting's type.

```go
if err := settings.Load(ctx, config.Get(), db); err != nil {
	return err
}

name := settings.GetString("site.name")
idle := settings.GetIntOr("auth.sessionIdleMinutes", 30)

err := settings.Set(ctx, db, userID, "site.maintenance", true)
```

- `Load(ctx, cfg, db) error` validates `cfg`, reads the rows and builds the values. It may run again: `cms.New` runs it, so every app of a process loads the same values.
- `GetInt`, `GetBool` and `GetString(key)` return the value. For an unknown key, a value of another type or settings not loaded yet, they return the zero value and log a warning with `slog`.
- `GetIntOr`, `GetBoolOr` and `GetStringOr(key, fallback)` return `fallback` in those cases, without a warning.
- `Set(ctx, db, userID, key, value) error` writes one declared setting. It checks the value's type, the validator and the rules, then upserts the row, or deletes it when `value` equals the default. The values change at once. A `userID` of 0 records no user (the installer writes settings before the first user exists).
- `Validate(values) error` reports why `Set` would refuse several values taken together, and writes nothing, so that a form can refuse all of them before it writes one. `Set` still writes one key at a time and checks the rules each time.
- `Declared() []Setting` lists the declared settings with their current values, sorted by key, for housekeeping's forms. A setting declared with `secret(...)` comes without its value, and `GetString` is the only way to read it.
- `Reload(ctx, db) error` rebuilds the values from the rows. Nothing calls it for now: the apps of one process share the values, and reloading for programs that run apart comes back with housekeeping or the orchestrator.
- `Set` and `Reload` before any `Load` return an error.

### Declaring a setting

Add the key to `catalogue` in `settings/catalogue.go` with `declare(default, validator)`. The default's Go type (`int`, `bool` or `string`) is the setting's type, and a nil validator accepts every value of that type. A rule that spans several settings goes into `rules` and lists every key it reads.

The tests check that every default passes its validator and the rules, and that no setting reuses a `config.json` key. A value needed before the database opens is not a setting: it belongs to `packages/config`.

### Rows

- A row is ignored, and logged with `slog.Warn` (key and reason, never the value), when its key comes from `config.json` or is not declared, when its value is not a JSON literal of the declared type (`null` included), or when its validator rejects it.
- When rows break a rule, each of them goes back to its default and is logged, because the rule cannot tell which row is wrong.
- A deleted row means the default applies again from the next `Load` or `Reload`.

### Gotchas

- `Set` refuses a value whose Go type differs from the default's: `int64(7)` is not an `int`.
- The store's pool has one connection, so calling `Load`, `Set` or `Reload` while holding a transaction blocks forever.

Gates, from `packages/virtual`:

```sh
gofmt -l .
go vet ./...
go test ./... -race
```
