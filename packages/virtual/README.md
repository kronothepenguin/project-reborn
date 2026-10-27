# virtual

In-memory state of Project Reborn's entities. Nothing here keeps a database connection: every function that reads or writes the database receives the `*sql.DB`, and the program that opened it stays its owner.

## Settings

`Settings` maps key paths to values, filled in this order:

1. the defaults declared in the catalogue (`catalogue.go`);
2. every `config.json` value, under the key path of its JSON tags (`cms.port`, `store.path`);
3. the rows of the `settings` table, whose `value` is a JSON literal of the setting's type.

```go
cfg := config.Get()
db := store.Must(store.Open(cfg.Store.Path))

settings, err := virtual.LoadSettings(ctx, cfg, db)
if err != nil {
	return err
}

name := settings.GetString("site.name")
idle := settings.GetIntOr("auth.sessionIdleMinutes", 30)

err = settings.Set(ctx, db, userID, "site.maintenance", true)
```

- `LoadSettings(ctx, cfg, db) (*Settings, error)` validates `cfg`, reads the rows and builds the map.
- `GetInt`, `GetBool` and `GetString(key)` return the value. For an unknown key or a value of another type they return the zero value and log a warning with `slog`.
- `GetIntOr`, `GetBoolOr` and `GetStringOr(key, fallback)` return `fallback` in those cases, without a warning.
- `Set(ctx, db, userID, key, value) error` writes one declared setting. It checks the value's type, the validator and the rules, then upserts the row, or deletes it when `value` equals the default. The map changes at once. A `userID` of 0 records no user (the installer writes settings before the first user exists).
- `Reload(ctx, db) error` rebuilds the map from the rows.

In one binary, cms and housekeeping share one `Settings` value and nothing reloads. A program running alone calls `Reload` every `cms.refresh` seconds and reads the interval again after each reload, because the interval is a setting too.

## Declaring a setting

Add the key to `catalogue` in `catalogue.go` with `declare(default, validator)`. The default's Go type (`int`, `bool` or `string`) is the setting's type, and a nil validator accepts every value of that type. A rule that spans several settings goes into `rules` and lists every key it reads.

The tests check that every default passes its validator and the rules, and that no setting reuses a `config.json` key. A value needed before the database opens is not a setting: it belongs to `packages/config`.

## Rows

- A row is ignored, and logged with `slog.Warn` (key and reason, never the value), when its key comes from `config.json` or is not declared, when its value is not a JSON literal of the declared type (`null` included), or when its validator rejects it.
- When rows break a rule, each of them goes back to its default and is logged, because the rule cannot tell which row is wrong.
- A deleted row means the default applies again from the next `Reload`.

## Gotchas

- `Set` refuses a value whose Go type differs from the default's: `int64(7)` is not an `int`.
- The store's pool has one connection, so calling `Set` or `Reload` while holding a transaction blocks forever.

Gates, from `packages/virtual`:

```sh
gofmt -l .
go vet ./...
go test ./... -race
```
