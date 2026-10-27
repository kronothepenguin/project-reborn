---
type: Task
title: Declare the P0 config sections and Create
description: Add settingsRefreshSeconds and the store, cms, auth and site sections to packages/config, plus Create for the installer.
status: done
phase: p0
depends_on: []
packages: [packages/config]
holo: [source/holo/config.php]
timestamp: 2026-10-27T21:58:32+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:58:32+00:00"}
---

# Goal

`config.Config` declares every key P0 needs ([0009](/decisions/0009-config-is-static-types.md)), following the
`adding-config-sections` skill.

# Steps

- [x] Root key `settingsRefreshSeconds` (default 1).
- [x] Section `store`: `path`.
- [x] Section `cms`: `port` (default 17387, the port `apps/cms` uses today).
- [x] Section `auth`: `secureCookies`, `sessionIdleMinutes`, `rememberDays`, `loginMaxFailures`,
      `loginWindowMinutes`, `passwordMinLength`, `passwordMaxLength`, `resetTokenMinutes`.
- [x] Section `site`: `name`, `shortName`, `url`, `maintenance`.
- [x] Each field: `Default<Field>()`, `Validate<Field>()`, unit tests and the five pipeline tests.
- [x] `Create(cfg *Config) error`: validate, then write `config.json` with `O_EXCL`; tests for writing a new file
      and refusing an existing one.
- [x] `packages/config/README.md` documents `Create`.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./...
```

Results (2026-10-27T21:58:32+00:00):

- `gofmt -l .` and `go vet ./...`: no output.
- `go test ./...`: ok for `config`, `config/auth`, `config/cms`, `config/site` and `config/store`; 122 test results,
  0 failures.
- Pipeline tests:
  - every key has four of the five mandatory checks: created with the default, missing key keeps the default and
    leaves the file untouched, explicit value wins, wrong type fails naming `config.json`, the key and the expected
    type;
  - every non-bool key also has the fifth: out of range fails naming `config.json`, the key and the allowed range;
  - extra: a partial `auth` section keeps the other defaults, and `passwordMaxLength` below `passwordMinLength`
    fails.
- `Create` tests:
  - it writes exactly the encoded config with mode `0644` and `Load` returns it;
  - it refuses an existing file with an `fs.ErrExist` error and leaves the file unchanged;
  - it rejects an invalid config without writing anything.
- Real messages:
  - `config: config.json: cms.port: expected int, got string`;
  - `config: config.json: cms.port: must be between 1 and 65535, got 70000`.
- Nothing outside `packages/config` imports it yet, so no other module is affected.

# Notes

Defaults:

- From Holo: passwords 6–25 characters, `rememberDays` 100 (Holo's remember-me cookie), `site.name` "Holo Hotel"
  and `site.shortName` "Holo" (Holo's `cms_system` seed, at most 30 characters).
- Holo had none, so these use conventional values: `sessionIdleMinutes` 30, `loginMaxFailures` 5 per
  `loginWindowMinutes` 15, `resetTokenMinutes` 60, `secureCookies` true, `store.path` `habbo.db`, `site.url`
  `http://localhost:17387`.

Validation:

- `store.path` rejects `?` and `#`, because `store.Open` builds a `file:` URI from it.
- `site.url` must be a bare http(s) origin, because reset links append a path to it.

Changes made on purpose:

- `Config.Validate()` prefixes the section (`fmt.Errorf("cms.%w", err)`), so errors carry the full key path that
  settings rows also use; `adding-config-sections` now shows that pattern.
- `TestLoadCreatesFileWhenAbsent` now expects the declared defaults instead of an empty `{}`.
- `Load`'s create-when-absent path and `Create` share one encoder.
- Bool keys have no out-of-range value, so they skip the fifth pipeline check.
- The installer must call `Create` before anything calls `Load`; this is documented in the README and on `Create`.

Later:

- [0023](/decisions/0023-config-holds-startup-keys.md) moved `site`, `auth` and `settingsRefreshSeconds` out of
  config; see [p0-13](/tasks/p0-13-settings-catalogue.md).
