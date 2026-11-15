---
type: Reference
title: Steps
description: The installer's routes, pages and what each step writes, and the rules that move a visitor between them.
---

# Steps

The `Installer` struct registers the routes over `packages/astro` resolvers and serves the built frontend from the
embedded `dist/`. Handlers live in `internal/router`, the installation itself in `internal/setup`.

| Route | Page | Does |
| --- | --- | --- |
| `GET /{$}` | `index.astro` | Shows the state; says the hotel is installed once an administrator exists, and links to `site.url` |
| `GET`, `POST /config` | `config.astro` | Database path, hotel port and housekeeping port: opens the database with `store.Open` (creating it with every update), then writes `config.json` with `config.Create` |
| `GET`, `POST /site` | `site.astro` | Site name, short name, URL, Housekeeping address, start credits and secure cookies, saved with `settings.Set` and no user |
| `GET`, `POST /admin` | `admin.astro` | Habbo name, email, birth date and password: one transaction creates, through `auth.CreateAccount`, the user, habbo, profile, home and wallet (5000 credits), and adds the user to the highest access group holding `housekeeping.accessGroups` |
| `GET /done` | `done.astro` | Shows where `config.json` and the database are, and links to `site.url` |

# Rules

- "Installed" means a user holds `housekeeping.accessGroups`. Once installed, every step redirects to the status page.
- `/site` and `/admin` redirect to `/config` until `config.json` exists.
- The config step opens the database before it writes `config.json`, so a path that cannot be opened leaves no
  `config.json`.
- The config step writes the CMS and housekeeping hosts as `localhost`, the proxy section disabled, and the game server's
  ports and the `reborn` section with their defaults. A pod edits `config.json` to change them.
- The site step offers housekeeping on the port chosen in the config step, while `site.housekeepingUrl` holds its
  default.
- The site step saves each key on its own and stops at the first error.
- Holo's ranks come from update `0003-ranks.sql`. On a new hotel the administrator joins Administrator; without a group
  holding `housekeeping.accessGroups`, the step fails with `setup.ErrNoGroup`.
- The administrator's first credits get a ledger row with the reason `registration` and the detail `installer`.
- A restarted installer continues: `New` opens the database named by an existing `config.json`. That also covers a
  database another program created: the installer then changes its default values and creates the administrator, once.
- The installer never applies database updates.
