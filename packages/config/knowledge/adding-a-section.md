---
type: Playbook
title: Adding a section
description: The files, registration point, test helpers and gates of packages/config that a new config.json key touches, for the adding-config-sections skill.
---

# Skill

The `adding-config-sections` skill holds the rules. This playbook names their places in this repo.

# Files

| File | Place |
| --- | --- |
| Section package | `packages/config/<section>/<section>.go`, imported as `github.com/kronothepenguin/project-reborn/packages/config/<section>` |
| Unit tests | `packages/config/<section>/<section>_test.go` |
| Root registration | `packages/config/config.go`: the `Config` struct, `defaults()` and `Config.Validate()` |
| Full-pipeline tests | `packages/config/<section>_pipeline_test.go`, `package config` |

- The file's contract: [The file's behaviour](/file-behaviour.md). `Differences` and `Rewrite` read the declared keys
  from `defaults()`, so the registration there reaches housekeeping's update page.
- Every key, with its type, default and allowed values: [Declared keys](/declared-keys.md). Add the new key to its
  table.
- Loading: [Usage](/usage.md).
- Settings are declared in `packages/virtual/settings/catalogue.go`, described in
  `packages/virtual/knowledge/settings.md`. They expose each config value under its key path:
  `settings.GetInt("cms.port")`.

# Test helpers

- `resetLoadState(t)` and `writeConfig(t, content)` in `packages/config/config_test.go`.
- `runKeyCases(t, []keyCase{...})` in `packages/config/pipeline_test.go` runs the five full-pipeline checks for each
  key; `cms_pipeline_test.go` shows one case per key. `loadWithFile(t, content)` loads a given file for a check of its
  own, such as `TestServerRefusesInfoAndMUSOnOnePort`.

# Gates

From `packages/config`:

```sh
gofmt -l .
go vet ./...
go test ./...
```
