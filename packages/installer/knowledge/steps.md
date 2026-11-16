---
type: Reference
title: Steps
description: The installer's routes, pages and what each step writes, and the rules that move a visitor between them.
---

# Steps

The `Installer` struct registers the routes over `packages/astro` resolvers and serves the built frontend from the
embedded `dist/`. Handlers live in `internal/router`, the installation itself in `internal/setup`.

`Mount` registers only `/installer/...`, so that the installer can share a mux with the site. Astro's `base` is
`/installer`, so the built pages and files carry the prefix; the static files are served through
`http.StripPrefix("/installer", ...)`. Every route is wrapped in `http.NewCrossOriginProtection`, since a shared mux is
not wrapped by its runner.

| Route | Page | Does |
| --- | --- | --- |
| `GET /installer/{$}` | `index.astro` | Shows the state; says the hotel is installed once an administrator exists, and links to `site.url` |
| `GET`, `POST /installer/config` | `config.astro` | The config step: opens the database with `store.Open` (creating it with every update), then writes `config.json` with `config.Create` |
| `GET`, `POST /installer/site` | `site.astro` | Site name, short name, URL, start credits and secure cookies, and housekeeping's address when run alone, saved with `settings.Set` and no user |
| `GET`, `POST /installer/admin` | `admin.astro` | Habbo name, email, birth date and password: one transaction creates, through `auth.CreateAccount`, the user, habbo, profile, home and wallet (5000 credits), and adds the user to the highest access group holding `housekeeping.accessGroups`; then redirects to `/` |

# Two forms

- `WithListener(l)` gives the installer a `Listener`, which moves the running hotel to a new address. reborn passes
  one. With it, the config step asks the database path, one host and one port, with the `reborn` section's defaults,
  and writes them to `reborn`. When the host or the port differs from `r.Host`, where the browser sent the request, it
  calls `Move`, which redirects the browser; a failed `Move` shows its error on the written page, with status 422.
  The site step asks no housekeeping address, saves `site.housekeepingUrl` as the site address plus `/housekeeping`,
  and suggests `http://<host>:<port>` as the site address while `site.url` holds its default.
- Without it, run alone, the config step asks the database path, the site's port and housekeeping's port, written to
  `cms.port` and `housekeeping.port`. The site step asks housekeeping's address, and offers housekeeping on the port
  chosen in the config step while `site.housekeepingUrl` holds its default.

# Rules

- "Installed" means a user holds `housekeeping.accessGroups`. `installer.Installed(ctx, db)` answers it for a program
  that holds the database. Once installed, every step redirects to the status page, `/installer/`.
- `(*Installer).Done()` is closed once the administrator exists, at start already when the database has one.
- After "Create administrator" the browser goes to `/`: inside reborn the site's front page, run alone the runner's
  redirect to the status page. There is no done page.
- `/installer/site` and `/installer/admin` redirect to `/installer/config` until `config.json` exists.
- The config step opens the database before it writes `config.json`, so a path that cannot be opened leaves no
  `config.json`.
- The config step writes every section it does not ask with its defaults: the CMS and housekeeping hosts as
  `localhost`, the proxy section disabled, the game server's ports, and the ports or the `reborn` section the other
  form asks. A pod edits `config.json` to change them.
- The site step saves each key on its own and stops at the first error.
- A failure answers 500 and is logged, unless the visitor abandoned the request (`context.Canceled`): it ends quietly.
- Holo's ranks come from update `0003-ranks.sql`. On a new hotel the administrator joins Administrator; without a group
  holding `housekeeping.accessGroups`, the step fails with `setup.ErrNoGroup`.
- The administrator's first credits get a ledger row with the reason `registration` and the detail `installer`.
- A restarted installer continues: `New` opens the database named by an existing `config.json`. That also covers a
  database another program created: the installer then changes its default values and creates the administrator, once.
- The installer never applies database updates.
