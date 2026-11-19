---
type: Go Package
title: Runtime
description: How cms.New starts the CMS, how it reads its settings, how Inject hands it its services, and how Mount wraps every route in its middleware chain.
resource: packages/cms/cms.go
---

# New

- `cms.New(db, WithResolver(…), WithStatic(…))` takes the db the runner opened with `store.FromConfig()`, applies the
  automatic database updates, and panics when the list of updates or the `proxy` section of `config.json` is broken.
- Only the resolver and the static handler are options, because they differ between the production and development
  runners.
- `New` schedules two tasks on `packages/scheduler`, each run only while the database is current:
  - expired reset links are deleted every minute;
  - expired sessions are deleted every minute.

# Settings

- A handler reads each setting from the store when it uses it, with `settings.String`, `Int` or `Bool(ctx, q, key)` of
  `packages/settings` (`packages/settings/knowledge/settings.md`). A setting staff save shows on the next page, and
  nothing refreshes.
- `q` is the router's queries, or the transaction's inside `inTx` or `WithTx`: the store has one connection, so a read
  through the router's queries while a transaction is open blocks forever.
- `internal/mail.Send` takes the queries too, and reads the `mail.*` settings on each send.

# Inject

- `Inject(cms.Services{Habbos: …})`, once after `New` and before `Mount`, hands the CMS the services that tell the game
  server of the changes it must show live (`packages/services/knowledge/index.md`). `Mount` gives them to the router.
- A service no runner injected is nil, and the CMS skips its calls.
- The looks page (`POST /account/looks`), the profile page (`POST /account/profile`) and the Me page's motto
  (`POST /me/motto`) call `Habbos.SendLook` once after a save, and never after a refused one.
- The call has a context of its own of 2 seconds, apart from the request's, so a request the visitor abandons still
  tells the game. A failure is logged, and the page answers as it would without the game.
- A page that shows habbos asks `Habbos.AreOnline` once, through the router's `online`, about the habbos it shows: the
  profile widget of a home, the staff page, the community page's random habbos, and a thread's post boxes with the
  viewer for its preview; the board asks about the viewer alone. The call ends after 1 second. An error, or no
  injected game, shows every habbo offline, and an error is logged.
- A habbo in the hotel shows Holo's online picture, and one outside the offline picture. An archived author shows
  offline and is left out of the question.

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
- The static files and the client's folder at `/dcr/` stand outside the chain ([The client page](/client.md)).
