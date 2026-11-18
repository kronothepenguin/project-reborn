---
type: Plan
title: "Hotel settings: how"
description: The settings catalogue in packages/settings declares the values, housekeeping writes them through its forms, and every program reads them from the store when it uses them.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/settings` | The settings catalogue: defaults and checks, `String`, `Int`, `Bool`, `Validate`, `Set` and `Declared` |
| `packages/housekeeping` | `GET /settings` and `POST /settings/{section}`, the dashboard `GET /` and its note `POST /note` (`packages/housekeeping/knowledge/index.md`) |
| `packages/cms` | Reads each setting when it uses it, and shows the maintenance page while `site.maintenance` is on |
| `packages/server` | Reads each setting when it uses it |

# Decisions

- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md) — Built in the
  [platform](/features/platform/spec.md) feature; housekeeping stays the single writer of settings after the install.
- [The session parameters are settings](/decisions/server/0034-session-parameters-are-settings.md) — The game client's
  ten session parameters are settings, edited in housekeeping's Game form.
- [Recycler Options is a section of housekeeping's
  settings](/decisions/server/0119-recycler-options-is-a-settings-section.md) — Recycler Options is one more settings
  form, opened by `housekeeping.settings`, saved and logged like the others.

