---
type: Go Package
title: settings
description: The list of the hotel's settings with their defaults, checks and rules, read from the store on each use and written with their checks.
resource: packages/settings
---

# What it is

`packages/settings` holds the list of the hotel's settings and reads each one from the `settings` table when it is used
(decision reborn/0006). A setting has a row only while its value differs
from its default. The package keeps no copy of the values, so a saved setting applies on the next read in every program.

# The rule

Pass the queries you hold. Inside a transaction, read and write through the transaction's queries (`q.WithTx(tx)`): the
store has one connection, so a read through `store.New(db)` while a transaction is open blocks forever.

# Examples

```go
q := store.New(db)
name := settings.String(ctx, q, "site.name")
idle := settings.Int(ctx, q, "auth.sessionIdleMinutes")

if err := settings.Validate(ctx, q, map[string]any{"auth.passwordMinLength": 8}); err != nil {
	// refuse the form
}
err := settings.Set(ctx, q, userID, "site.maintenance", true)
```

# Functions

- `String`, `Int` and `Bool(ctx, q, key)` return the row's value, or the declared default when the setting has no row
  or a bad one. A key that is not a declared setting of that type is logged and returns the zero value.
- `Set(ctx, q, userID, key, value) error` checks the value's type, its validator and the rules that tie it to another
  setting, against that setting's stored value, then upserts the row, or deletes it when `value` equals the default. A
  `userID` of 0 records no user (the installer writes settings before the first user exists). It writes even an
  unchanged value, so `updated_at` records the last call.
- `Validate(ctx, q, candidates) error` reports why `Set` would refuse several values taken together, and writes nothing,
  so that a form refuses all of them before it writes one. A rule reads the stored value of a partner that is not
  among the candidates.
- `Declared(ctx, q) ([]Setting, error)` lists every declared setting with its current value and its default, sorted by
  key, from one query. A secret comes without its value: `String` is the only way to read it.

# Declaring a setting

Add the key to `catalogue` in `catalogue.go` with `declare(default, validator)`. The default's Go type (`int`, `bool`
or `string`) is the setting's type, and a nil validator accepts every value of that type. A rule that ties several
settings goes into `rules` and lists every key it reads.

The tests check that every default passes its validator and the rules, and that no setting reuses a `config.json` key.
A value needed before the database opens is not a setting: it belongs to `packages/config`, and it is read from
`config`.

# Values

- `site.url` is a bare http(s) origin, because reset links add a path such as `/reset/<token>` to it.
- Passwords keep Holo's defaults: 6 to 25 characters (`auth.passwordMinLength`, `auth.passwordMaxLength`).
- `auth.rememberDays` keeps Holo's default of 100.
- The site names default to Reborn: `site.name` is "Reborn Hotel" and `site.shortName` is "Reborn". A hotel that saved
  "Holo Hotel" while it was the default holds no row, so it shows "Reborn Hotel" now.

# Rows

- A row whose value is not a JSON literal of the declared type (`null` included), or that its validator rejects, reads
  as the default. It is logged with `slog.Warn` once, and again when its reason changes, with its key and reason and
  never its value, because `mail.password` is a secret.
- A read trusts the rows: two rows that break a rule together read as stored. The rules are checked when a setting is
  saved.
- A row with a key nothing declares is noticed only when something reads that key.

# Gotchas

- `Set` refuses a value whose Go type differs from the default's: `int64(7)` is not an `int`.
- A failed query is logged with `slog.Error`, and the read returns the default.
