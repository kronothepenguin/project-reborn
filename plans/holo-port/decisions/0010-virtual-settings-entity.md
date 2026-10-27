---
type: Decision
title: Settings entity in packages/virtual
description: packages/virtual holds a Settings entity, a type-safe wrapper over config with the settings rows merged in, which receives the database instead of holding it.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [virtual, config, settings]
---

# Decision

- `packages/virtual` is the in-memory representation of entities and state, later also the game server's. It
  never keeps a database connection; its functions receive the `*sql.DB`.
- `Settings`:

  | Function | Behaviour |
  | --- | --- |
  | `LoadSettings(ctx, cfg *config.Config, db *sql.DB) (*Settings, error)` | One short read of the `settings` table at startup, merged over `cfg`. |
  | `(*Settings).Config() *config.Config` | Type-safe merged values (`s.Config().Site.Name`), a read-only snapshot in an atomic pointer. |
  | `(*Settings).Base() *config.Config` | `config.json` plus declared defaults, without rows. |
  | `(*Settings).Update(ctx, db, userID, func(*config.Config)) error` | Edits a copy, runs `Validate()`, writes each changed key path in one transaction (upsert, or delete when equal to `Base()`), swaps the snapshot. Refuses startup-only keys (`store.path`, `cms.port`, `housekeeping.port`). |
  | `(*Settings).Reload(ctx, db) error` | Re-reads the rows. |

- Merge: config → JSON → each row's key path set from its JSON literal → decode → `Validate()`. Invalid or
  undeclared rows are skipped and logged with `slog`. A deleted row means the `Base()` value applies.
- In one binary, `Update` changes the shared snapshot immediately. When cms and housekeeping run as separate
  processes, their runners call `Reload` every `settingsRefreshSeconds`.

# Context

Rejected during planning: a live type inside `packages/config` (config must stay static), a `Settings` that opened
and kept the database, and a generic list of keys (housekeeping uses one typed form per config section and compares
`Config()` with `Base()` to show overrides).

# Consequences

- Runners open the database themselves and pass it to `virtual`, `auth` and the app packages.
