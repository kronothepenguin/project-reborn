---
type: Decision
title: Settings are declared keys read through typed getters
description: packages/virtual holds Settings, a map of key paths filled from declared defaults, config.json and the settings rows, read with typed getters and written one key at a time.
status: accepted
timestamp: 2026-10-27T22:57:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T22:57:14+00:00"}
tags: [virtual, settings]
---

# Decision

- `packages/virtual` still never keeps a database connection; its functions receive the `*sql.DB`.
- Every setting is declared once in a catalogue in `packages/virtual`, with its key path, type, default and
  validator. Rules that span several settings sit beside it: `auth.passwordMaxLength` must be at least
  `auth.passwordMinLength`.
- `Settings` holds a `map[string]any` keyed by key path, filled in this order:
  1. the declared defaults;
  2. every `config.json` value, under the key path of its JSON tags (`cms.port`);
  3. the rows of the `settings` table (`site.name`, `cms.refresh`).
- A row is ignored and logged with `slog` in four cases:
  - its key comes from `config.json`;
  - its key is not declared;
  - its value is not a JSON literal of the declared type;
  - a validator or a rule rejects its value.
- A deleted row means the default applies again.

  | Function | Behaviour |
  | --- | --- |
  | `LoadSettings(ctx, cfg *config.Config, db *sql.DB) (*Settings, error)` | Builds the map once at startup. |
  | `GetInt`, `GetBool`, `GetString(key)` | The value; for an unknown key or a value of another type, the zero value and a `slog` warning. |
  | `GetIntOr`, `GetBoolOr`, `GetStringOr(key, fallback)` | The value, or `fallback` for an unknown key or a value of another type. |
  | `Set(ctx, db, userID, key, value) error` | Validates one declared key and writes its row; a value equal to the default deletes the row instead. The map changes at once. |
  | `Reload(ctx, db) error` | Rebuilds the map from the rows. |

- Reloading depends on how the programs run:
  - In one binary, cms and housekeeping share one `Settings` value, so nothing reloads.
  - A program running alone calls `Reload` every `cms.refresh` seconds. The interval is itself a setting, so it
    can change at runtime.

# Context

Supersedes [0010](/decisions/0010-virtual-settings-entity.md). The user asked for a map with typed getters instead
of a typed wrapper over `config.Config`. The user then chose:

- a declared catalogue for defaults and validation;
- getters that return the zero value with a warning, plus `…Or` variants that take a default;
- `Set` for one key at a time.

# Consequences

- The installer's site step ([0016](/decisions/0016-installer.md)) and housekeeping's settings forms write with
  `Set`, one key at a time.
- Which key a housekeeping running alone reads for its reload interval is decided in HK-A.
