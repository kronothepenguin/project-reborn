---
type: Phase
title: HK-A Housekeeping core
description: Housekeeping scaffold and layout, dashboard, settings editor, access groups and the staff log.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [hk-a, housekeeping]
---

# Goal

Staff with `housekeeping.access` open `/housekeeping`, see the dashboard, edit settings, manage access groups and
read the staff log; every change is logged.

# Scope

- `make create name=housekeeping`, then: `astro.config.mjs` `base: "/housekeeping"`; `Mount` registers only
  `/housekeeping/...` and serves `dist` through `http.StripPrefix`; the dev resolver base includes
  `/housekeeping` ([0003](/decisions/0003-housekeeping-under-prefix.md)).
- Layout `src/layouts/housekeeping.astro`: tab strip, left menu and content, in the
  [housekeeping colours](/reference/colours.md#housekeeping).
- One helper writes a `staff_logs` row for every mutation.
- Config: `housekeeping.port`, `housekeeping.note`.

| Holo `?p=` | Route under `/housekeeping` | Attribute / notes |
| --- | --- | --- |
| login, logout | none (shared session) | non-staff get 403 |
| dashboard | `GET /{$}`, `POST /note` | counts (habbos, groups, active bans, logs), holders of `housekeeping.accessGroups`, shared note saved with `Settings.Update` |
| site, maintenance, cms_config, content | `GET /settings`, `POST /settings/{section}` | `housekeeping.settings`; one typed form per config section; overrides shown by comparing `Config()` with `Base()`; revert sets the field back to `Base()`; `mail.password` masked |
| ranktool | `GET/POST /access-groups`, `GET/POST /access-groups/{id}`, `POST /users/{id}/access-groups` | `housekeeping.accessGroups`; attribute checkboxes, `staff_listed`, display habbo, last-holder guard |
| logs | `GET /logs` | `housekeeping.logs` |

# Exit criteria

- A user without `housekeeping.access` gets 403 on every route.
- Turning maintenance on shows the CMS maintenance page; deleting the row reverts it.
- Removing `housekeeping.accessGroups` from its last holder is refused.

# Tasks

Created when the phase starts.
