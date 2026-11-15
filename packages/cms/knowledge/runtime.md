---
type: Go Package
title: Runtime
description: How cms.New starts the CMS and how Mount wraps every route in its middleware chain.
resource: packages/cms/cms.go
---

# New

- `cms.New(db, WithResolver(…), WithStatic(…))` takes the db the runner opened with `store.FromConfig()`, applies the
  automatic database updates and loads the settings (`virtual/settings`), panicking when it cannot.
- Only the resolver and the static handler are options, because they differ between the production and development
  runners.
- `New` schedules three tasks on `packages/scheduler`, each run only while the database is current:
  - the settings reload every `cms.refresh` seconds, because housekeeping is the single writer of settings;
  - expired reset links are deleted every minute;
  - expired sessions are deleted every minute.

# Mount and the middleware chain

`Mount` wraps every CMS route, so the CMS stays protected on a mux it shares with other apps. From the outside in:

| Layer | What it does |
| --- | --- |
| `router.UpdateFailed` | Once an automatic update failed at start, every page answers `update-failed.html` with 503. It stands outside the session reader, because the code may not work on the database the failure left. |
| `auth.RealIP`, cross-origin protection, `auth.Sessions` | The visitor's address, the refusal of cross-site writes, and the session. |
| `router.Banned` | A banned visitor loses the session and sees the ban. It runs before the maintenance check, as Holo's `core.php` did. |
| `router.Maintenance` | While `site.maintenance` is on, or updates wait, a page serves `maintenance.html` with 503. Users holding `site.maintenanceBypass` see the site. |
| `router.Guest`, `auth.RequireSession` | Per route: pages for guests only, or for signed-in visitors only. |

- `POST /` (sign in) and `POST /logout` skip the maintenance check, so staff sign in during maintenance. A failed
  sign-in stays on the maintenance page.
- The static files stand outside the chain.
