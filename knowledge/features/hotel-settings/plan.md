---
type: Plan
title: "Hotel settings: how"
description: The settings catalogue in packages/virtual holds the values, housekeeping writes them through its forms, and the CMS and the game server read them again on a schedule.
---

# Architecture

| Project | Part |
| --- | --- |
| `packages/virtual` | The settings catalogue, `virtual/settings`: defaults and checks, `Load`, `Reload`, `Validate`, `Set` and `Declared` |
| `packages/housekeeping` | `GET /settings` and `POST /settings/{section}`, the dashboard `GET /` and its note `POST /note` (`packages/housekeeping/knowledge/index.md`) |
| `packages/cms` | Reads the settings again every `cms.refresh` seconds, and shows the maintenance page while `site.maintenance` is on |
| `packages/server` | Reads the settings again every `cms.refresh` seconds |

# Decisions

- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md) — Planned in the
  [platform](/features/platform/spec.md) feature, in force for housekeeping as the single writer of settings after the
  install; it replaces the refresh every `cms.refresh` seconds that runs today.
- [The session parameters are settings](/decisions/server/0034-session-parameters-are-settings.md) — The game client's
  ten session parameters are settings, edited in housekeeping's Game form.
- [Recycler Options is a section of housekeeping's
  settings](/decisions/server/0119-recycler-options-is-a-settings-section.md) — Recycler Options is one more settings
  form, opened by `housekeeping.settings`, saved and logged like the others.

# Notes

- The refresh is one query a second per running CMS at the default `cms.refresh`. A failed read keeps the current
  values, and the scheduler logs the error.
