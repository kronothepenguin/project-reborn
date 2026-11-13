---
type: Decision
title: Config is static types; settings map onto config keys
description: packages/config holds static types describing config.json, and database settings rows override config keys at runtime.
status: superseded
superseded_by: "0023"
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [config, settings]
---

# Decision

- `packages/config` is the static, type-safe description of `config.json`: startup values (database path, ports)
  and a declared default and validator for every key, following `adding-config-sections`.
- Settings are rows of the `settings` table: `key` is a config key path (`site.name`), `value` a JSON literal.
  They are a table, not a package.
- The merge of both lives in `packages/virtual` ([0010](/decisions/0010-virtual-settings-entity.md)).
- The only new function in `packages/config` is `Create(cfg)`, which writes `config.json` only when it does not
  exist. Only the installer calls it.

# Context

Holo kept site settings in a single-row `cms_system` table, texts and toggles in `cms_content` and emulator
settings in `system_config`, all edited from housekeeping. The user defined config as the initial, required values
and settings as dynamic key/value values stored in the database.

# Consequences

- Every value that housekeeping can change is first declared as a config key with a default and a validator.
