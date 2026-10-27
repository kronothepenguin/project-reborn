---
type: Task
title: Declare the P0 config sections and Create
description: Add settingsRefreshSeconds and the store, cms, auth and site sections to packages/config, plus Create for the installer.
status: todo
phase: p0
depends_on: []
packages: [packages/config]
holo: [source/holo/config.php]
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

`config.Config` declares every key P0 needs ([0009](/decisions/0009-config-is-static-types.md)), following the
`adding-config-sections` skill.

# Steps

- [ ] Root key `settingsRefreshSeconds` (default 1).
- [ ] Section `store`: `path`.
- [ ] Section `cms`: `port` (default 17387, the port `apps/cms` uses today).
- [ ] Section `auth`: `secureCookies`, `sessionIdleMinutes`, `rememberDays`, `loginMaxFailures`,
      `loginWindowMinutes`, `passwordMinLength`, `passwordMaxLength`, `resetTokenMinutes`.
- [ ] Section `site`: `name`, `shortName`, `url`, `maintenance`.
- [ ] Each field: `Default<Field>()`, `Validate<Field>()`, unit tests and the five pipeline tests.
- [ ] `Create(cfg *Config) error`: validate, then write `config.json` with `O_EXCL`; tests for writing a new file
      and refusing an existing one.
- [ ] `packages/config/README.md` documents `Create`.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./...
```

# Notes

- Defaults (port numbers, limits) come from Holo where it had them; see
  [the database reference](/reference/holo-database.md#holo-settings).
