---
type: Task
title: Move runtime values into the settings catalogue
description: Reduce packages/config to the startup keys and rewrite virtual.Settings as a map filled from declared defaults, config.json and the settings rows, with typed getters and Set.
status: done
phase: p0
depends_on: [p0-07, p0-08]
packages: [packages/config, packages/virtual, packages/store]
holo: []
timestamp: 2026-10-27T23:04:43+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T22:57:14+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T23:04:43+00:00"}
---

# Goal

Implement [0023](/decisions/0023-config-holds-startup-keys.md) and
[0024](/decisions/0024-settings-catalogue-and-getters.md).

# Steps

- [x] `packages/config`: remove the `site` and `auth` sections and `SettingsRefreshSeconds`, so `Config` keeps
      `store` and `cms`; update the tests and the README.
- [x] `adding-config-sections`: config holds only startup keys; runtime values are declared in the settings
      catalogue.
- [x] `packages/virtual` catalogue: `cms.refresh` and the former `site.*` and `auth.*` keys with their defaults and
      validators, plus the password-length rule.
- [x] `LoadSettings(ctx, cfg, db)`, `GetInt`, `GetBool`, `GetString`, `GetIntOr`, `GetBoolOr`, `GetStringOr`,
      `Set(ctx, db, userID, key, value)` and `Reload(ctx, db)`.
- [x] Tests on a temporary `config.json` and database:
  - catalogue defaults and rules, config keys in the map;
  - row override, deleted row, invalid rows, undeclared and config-key rows, rows breaking a rule;
  - getters (zero with a warning, fallback);
  - `Set` (write, delete at the default, refusals), `Reload`, reads during writes.
- [x] Docs: `packages/virtual/README.md`, `packages/config/README.md`, and the store's settings schema comment and
      concepts.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./...
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/store && go tool sqlc generate && git diff --exit-code -- '*.go' && make check-docs
```

Results (2026-10-27T23:04:43+00:00):

- `packages/config`:
  - `gofmt -l .` and `go vet ./...` print nothing;
  - `go test ./...` is ok for `config`, `config/cms` and `config/store`: 33 test results, 0 failures.
- `packages/virtual`:
  - `gofmt -l .` and `go vet ./...` print nothing;
  - `go test ./... -race` is ok: 26 test results (20 tests and 6 `Set` refusal subtests), 0 failures;
  - with the rule reset disabled, the suite fails, so the rule tests check it.
- `packages/store`: `sqlc generate` leaves the Go code unchanged, `make check-docs` passes and `go test ./... -race`
  is ok.
- `go build ./...` and `go vet ./...` pass in `packages/config`, `packages/virtual`, `packages/store`,
  `packages/cms`, `apps/cms`, `packages/astro` and `tools/create`.
- `adding-config-sections` passes the strict skill validator: 0 errors, 0 warnings.
- Sample warnings:
  - `msg="virtual: settings row ignored" key=cms.port reason="comes from config.json"`;
  - `msg="virtual: settings row ignored" key=auth.passwordMinLength reason="auth.passwordMaxLength: must be at least auth.passwordMinLength (30), got 25"`;
  - `msg="virtual: setting is missing or of another type" key=site.name want=int`.

# Notes

Config:

- `Config` keeps `store.path` and `cms.port`. `packages/config/site`, `packages/config/auth` and their pipeline tests
  are deleted. Their defaults and validators moved unchanged into the catalogue, and `settingsRefreshSeconds` became
  `cms.refresh` (default 1, 1–3600).

Settings:

- The catalogue lives in `packages/virtual/catalogue.go`. `declare(default, validator)` takes the type from the
  default; the supported types are `int`, `bool` and `string`.
- Config values enter the map by reflection over the JSON tags (`reflect.Value.Fields`), so they keep their Go types
  (`cms.port` is an `int`).
- `GetBoolOr` and `GetStringOr` were added beside the requested `GetIntOr` so that every getter has an `…Or` form.
  The `…Or` getters log nothing.
- A broken rule cannot tell which row is wrong, so every row it reads goes back to its default and is logged. This
  replaces the passes of p0-08.
- `Set` writes even when the value has not changed, so `updated_at` and `updated_by_user_id` record the last call.
- `LoadSettings` still validates `cfg`, `Set` still takes user 0 for no user, and ignored rows are still logged
  without their value.
- `Config()`, `Base()` and `Update` are gone.

Not part of this task:

- The reload ticker belongs to the runners (p0-11).
- Decision 0016's accepted text still says `Update`; decision 0024 records that the site step uses `Set`.

Git:

- The `p0-08` files you staged stay staged. The deletions and edits of this task are unstaged.
