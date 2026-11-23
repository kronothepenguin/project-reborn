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
| `GET`, `POST /installer/config` | `config.astro` | The config step: run alone, opens the database with `store.Open` (creating it with every update), then writes `config.json` with `config.Create`; inside reborn, moves the hotel and saves its address |
| `GET`, `POST /installer/site` | `site.astro` | Site name, short name, URL, start credits and secure cookies, and housekeeping's address when run alone, saved with `settings.Set` and no user |
| `GET`, `POST /installer/client` | `client.astro` | The client files step: names `<assets.path>/dcr/` and lists `external_variables.txt` and `external_texts.txt` with their count of lines, or as missing. "Import client files" (`action=import`) imports both with `dcr.Import` in one transaction; "Skip" (`action=skip`) imports nothing. With a file missing, the page says where to put it, offers "Check again" (a link to the same page) and "Skip", and an import answers 422 and imports nothing |
| `GET`, `POST /installer/admin` | `admin.astro` | Habbo name, email, birth date and password: one transaction creates, through `auth.CreateAccount`, the user, habbo, profile, home and wallet (5000 credits), and adds the user to the highest access group holding `housekeeping.accessGroups`; then redirects to `/` |

# Two forms

- `Inject(installer.Services{Listener: l})`, once after `New` and before `Mount`, gives the installer a `Listener`,
  which moves the running hotel to a new address. reborn injects one; the runners of the installer alone inject
  nothing. With it, `config.json` exists when the installer opens and its database is open, so the config step asks
  only a host and a port, with the values of the `reborn` section, and shows the database `config.json` names. It
  validates them with the `reborn` section's validators. When the host or the port differs from the `reborn` section,
  where the hotel listens, it calls `Move` first, which redirects the browser to the same path on the new address,
  and then saves the address into the `reborn` section with `config.SaveReborn`. A failed `Move` saves nothing and shows its
  error in the form, with status 422, and the form takes another address. The address where the hotel listens moves
  nothing, is saved, and the step goes on to `/installer/site`: after a move, the browser lands on the form at the new
  address, and "Save address" goes on. A save that fails after a move is logged, since the
  browser has left.
  The site step asks no housekeeping address, saves `site.housekeepingUrl` as the site address plus `/housekeeping`,
  and suggests `http://<host>:<port>` as the site address while `site.url` holds its default.
- Without it, run alone, the config step asks the database path, the site's port and housekeeping's port, written to
  `cms.port` and `housekeeping.port` with `config.Create`. The site step asks housekeeping's address, and offers
  housekeeping on the port chosen in the config step while `site.housekeepingUrl` holds its default.

# Rules

- "Installed" means a user holds `housekeeping.accessGroups`. Once installed, every step redirects to the status page,
  `/installer/`.
- `(*Installer).Installed()` reports whether the administrator exists, at start already when the database has one.
  `(*Installer).WaitForInstall(ctx)` returns once the administrator exists, or with `ctx`'s error when `ctx` ends first:
  reborn's runner waits on it.
- After "Create administrator" the browser goes to `/`: inside reborn the site's front page, run alone the runner's
  redirect to the status page. There is no done page.
- The order of the steps lives in `setup.Steps`: config, site, client, admin. A step that passes sends the browser to
  the next. A step opened before the one it follows redirects to the first step that waits, `(*State).Waiting()`; a
  step passed opens again. The config step passes once `config.json` exists; the others pass in memory, so a
  restarted installer continues at the site step. The status page's "Continue" links to the step that waits.
- Run alone, the config step opens the database before it writes `config.json`, so a path that cannot be opened leaves
  no `config.json`.
- Run alone, the config step writes every section it does not ask with its defaults: the CMS and housekeeping hosts as
  `localhost`, the proxy section disabled, the game server's ports, and the `reborn` section. A pod edits
  `config.json` to change them.
- The site step saves each key on its own and stops at the first error.
- A failure answers 500 and is logged, unless the visitor abandoned the request (`context.Canceled`): it ends quietly.
- Holo's ranks come from update `0003-ranks.sql`. On a new hotel the administrator joins Administrator; without a group
  holding `housekeeping.accessGroups`, the step fails with `setup.ErrNoGroup`.
- Only the client files step imports the client's files; the administrator step imports none. A step skipped leaves
  the tables empty, and housekeeping's Client Files page imports them later.
- The count of lines on the client files step counts the lines that are not empty, the ones `dcr.Import` saves.
- The administrator's first credits get a ledger row with the reason `registration` and the detail `installer`.
- `New(ctx, db, opts...)` takes the database. reborn passes the one it opened, and the installer works on it and
  creates none. The runners of the installer alone pass `nil`, and the config step creates it.
- A restarted installer continues: with `nil`, `New` opens the database named by an existing `config.json`. That also covers a
  database another program created: the installer then changes its default values and creates the administrator, once.
- The installer never applies database updates.
- The installer reads each setting from the store when it uses it, with `settings.String`, `Int` and `Bool`, and saves
  with `settings.Set`. A setting with no row reads as its declared default
  (`knowledge/decisions/reborn/0006-settings-are-read-from-the-store.md`).
