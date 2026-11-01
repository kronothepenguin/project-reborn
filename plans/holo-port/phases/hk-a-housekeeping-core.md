---
type: Phase
title: HK-A Housekeeping core
description: Housekeeping scaffold and layout, dashboard, settings editor, access groups and the staff log.
status: active
timestamp: 2026-11-01T21:07:47+00:00
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
  [housekeeping colours](/reference/colours.md#housekeeping) and the new design system of
  [0041](/decisions/0041-housekeeping-design-system.md). Its reference is `docs/hk.png`: a grey bar with who is logged in
  and their previous login, navy tabs with the active one in blue over a blue strip, a left column of white boxes with a
  blue title bar and `- link` lists, and a plain heading and text as the content.
- One helper writes a `staff_logs` row for every mutation.
- Config: `housekeeping.port`. Settings: `housekeeping.note`.
- Housekeeping creates and uses an empty database, as the CMS does
  ([0049](/decisions/0049-store-is-the-global-database.md)). Its work runs on a feature branch, in parallel with
  P2 ([0046](/decisions/0046-main-and-feature-branches.md)).

| Holo `?p=` | Route under `/housekeeping` | Attribute / notes |
| --- | --- | --- |
| login, logout | none (shared session) | non-staff get 403 |
| dashboard | `GET /{$}`, `POST /note` | counts (habbos, groups, active bans, logs), holders of `housekeeping.accessGroups`, shared note saved with `settings.Set` |
| site, maintenance, cms_config, content | `GET /settings`, `POST /settings/{section}` | `housekeeping.settings`; forms over the declared settings, saved with `settings.Set`; a value set back to its default deletes the row; `mail.password` masked |
| ranktool | `GET/POST /access-groups`, `GET/POST /access-groups/{id}`, `POST /users/{id}/access-groups` | `housekeeping.accessGroups`; attribute checkboxes, `staff_listed`, display habbo, last-holder guard |
| logs | `GET /logs` | `housekeeping.logs` |

# Exit criteria

- A user without `housekeeping.access` gets 403 on every route.
- Turning maintenance on shows the CMS maintenance page; deleting the row reverts it.
- Removing `housekeeping.accessGroups` from its last holder is refused.

# Tasks

- [hk-a-01 Bring the tools/create templates to the current conventions](/tasks/hk-a-01-create-templates.md) — done
- [hk-a-02 Add the housekeeping section to packages/config](/tasks/hk-a-02-housekeeping-config.md) — done
- [hk-a-03 Scaffold housekeeping and guard its routes](/tasks/hk-a-03-scaffold-and-access.md) — done
- [hk-a-04 Build the housekeeping layout](/tasks/hk-a-04-layout.md) — done
- [hk-a-05 Write the staff log helper and page](/tasks/hk-a-05-staff-log.md) — done
- [hk-a-06 Build the dashboard and the shared note](/tasks/hk-a-06-dashboard.md) — done
- [hk-a-07 Build the settings editor](/tasks/hk-a-07-settings-editor.md) — todo
- [hk-a-08 Build access groups](/tasks/hk-a-08-access-groups.md) — todo
- [hk-a-09 Verify the HK-A exit criteria](/tasks/hk-a-09-exit-check.md) — todo

# Open questions

- How a CMS running alone learns of a settings change: the IPC of [0040](/decisions/0040-housekeeping-writes-settings.md),
  and what happens to `cms.refresh`.
