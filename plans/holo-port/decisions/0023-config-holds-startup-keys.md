---
type: Decision
title: config.json holds only startup keys
description: packages/config declares only the values a program needs before the database opens; every other value is a setting declared in packages/virtual.
status: accepted
timestamp: 2026-10-27T22:57:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T22:57:14+00:00"}
tags: [config, settings]
---

# Decision

- `packages/config` stays the static, type-safe description of `config.json`, but only for the keys a program needs
  before the database opens: `store.path` and `cms.port`, plus `housekeeping.port` once HK-A adds it.
- Every other value is a setting, declared in `packages/virtual`
  ([0024](/decisions/0024-settings-catalogue-and-getters.md)) and stored in the `settings` table. That covers the
  site name, maintenance mode, the auth limits, the reload interval and the keys later phases add.
- A settings row never overrides a `config.json` key.
- `Create(cfg)` stays; only the installer calls it.

# Context

Supersedes [0009](/decisions/0009-config-is-static-types.md). The user pointed out that a program starts from the
initial config, opens the database and only then loads the site settings, so the `site` section and
`settingsRefreshSeconds` were never config. Asked which keys stay in `config.json`, the user chose the startup keys
only, so the auth limits became settings too.

# Consequences

- `packages/config/site`, `packages/config/auth` and `Config.SettingsRefreshSeconds` are removed;
  `settingsRefreshSeconds` becomes the setting `cms.refresh`.
- Several keys are called config keys in [0008](/decisions/0008-configurable-avatar-imaging.md) and in the phase
  files. They are settings: `imaging.*`, `registration.*`, `mail.*`, `features.*`, `homes.*`, `groups.*`,
  `club.*` and the others like them.
- `adding-config-sections` applies only to startup keys.
