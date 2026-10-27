---
type: Task
title: Build the Settings entity in packages/virtual
description: Create the packages/virtual module with a type-safe Settings wrapper that merges settings rows over config and receives the database.
status: done
phase: p0
depends_on: [p0-06, p0-07]
packages: [packages/virtual]
holo: []
timestamp: 2026-10-27T22:29:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T22:29:49+00:00"}
---

# Goal

Implement [0010](/decisions/0010-virtual-settings-entity.md).

# Steps

- [x] `mkdir packages/virtual && cd packages/virtual && go mod init github.com/kronothepenguin/project-reborn/packages/virtual`,
      then `go work use ./packages/virtual` from the repository root.
- [x] `LoadSettings(ctx, cfg, db)`, `Config()`, `Base()`, `Update(ctx, db, userID, fn)`, `Reload(ctx, db)`.
- [x] Merge through JSON key paths; invalid and undeclared rows skipped and logged with `slog`.
- [x] `Update` validates, writes only changed paths in one transaction, deletes rows equal to `Base()` and refuses
      `store.path`, `cms.port` and `housekeeping.port`.
- [x] Tests (temporary directory with `config.json` and a temporary database): override, deleted row, invalid row,
      undeclared key, only changed keys written, revert by equal value, startup-only refusal, `Reload`.

# Verification

```sh
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-10-27T22:29:49+00:00):

- `gofmt -l .` and `go vet ./...`: no output.
- `go test ./... -race`: ok; 21 test results (17 tests and 4 subtests), 0 failures.
- `TestMain` writes a `config.json` with `site.name` "Base Hotel" and loads it once, because `config.Load` reads
  the file once per process. Each test opens its own temporary database.
- Tests named in the steps:
  - override, deleted row (with `Reload`), invalid rows, undeclared and startup-only rows, only changed keys
    written, revert by equal value, startup-only refusal, `Reload` picking up rows written elsewhere;
  - invalid, undeclared and startup-only rows are checked in the captured `slog` output.
- Extra tests:
  - `LoadSettings` refuses an invalid config;
  - rows valid only together survive an invalid row;
  - a row that conflicts with the base is ignored;
  - `Update` with user 0 records no user;
  - `Update` rejects invalid values and changes nothing;
  - `Update` without changes writes nothing;
  - `Config()` and `Base()` return copies;
  - `Config()` reads race-free during updates.
- A sample warning:
  `level=WARN msg="virtual: settings row ignored" key=auth.sessionIdleMinutes reason="auth.sessionIdleMinutes: must be between 5 and 1440, got 1"`.
- `go vet ./...` still passes in `packages/config`, `packages/store`, `packages/cms` and `apps/cms`.

# Notes

Module setup:

- `go mod init` wrote `go 1.27.3` and `go work use` raised `go.work` to match; both were set back to `1.27.0`
  like the other modules.
- `go.mod` has no `require` lines for `packages/config` and `packages/store`; the workspace resolves them.
  `packages/cms` pins `packages/astro` to the pseudo-version of a pushed commit, but the current config and store
  code exists only in local commits (main is ahead of origin), so no such version exists yet.

JSON:

- The new JSON code uses `encoding/json/v2`, following the repository's modern-Go guideline (Go 1.27, no
  experiment flag). `packages/config` keeps v1.

Choices inside decision 0010:

- `userID` is an `int64`, with 0 meaning no user, because the installer saves the site step before the
  administrator exists; `settings.updated_by_user_id` is nullable.
- `LoadSettings` validates `cfg` before reading rows.
- A `null` row value is invalid: v2 would decode it as the zero value.
- Rows are applied together first. When that fails, they are applied one at a time in passes until a pass
  accepts none, so one bad row does not drop valid rows that a cross-field rule accepts only together.
- Warnings log the key and the reason, never the value, because later keys such as `mail.password` hold secrets.
- `Config()` and `Base()` return copies, so callers cannot change the shared snapshot.
- `Update` handles changed keys in key order, so with several startup-only keys the error names the first.

Beyond the steps:

- Added `packages/virtual/README.md` with the API, the row rules and the gotchas: `Update` blocks forever inside
  another transaction (single connection), and `edit` must not call `Update` or `Reload`.

Open for p0-11:

- `settingsRefreshSeconds` is not startup-only, so a row can change it. The runner's `Reload` ticker should follow
  the new value; this needs the user's decision.

Later:

- [0024](/decisions/0024-settings-catalogue-and-getters.md) replaced this API with a key map, typed getters and
  `Set`. It also settled the open point: the interval is the setting `cms.refresh`, read again after each reload.
  See [p0-13](/tasks/p0-13-settings-catalogue.md).
