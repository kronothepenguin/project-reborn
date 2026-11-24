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
| `GET`, `POST /installer/settings` | `settings.astro` | The settings step: six groups open with the installer's titles (New players, Password reset mail, Avatar pictures, Site features, Prices, Game ads) and every other field of `settings.Groups()` under "More settings", by its group's `Title`, less the site step's settings and the switches that close the site and the hotel. "Save settings" (`action=save`, and the Enter key) checks the changed values together with `settings.Validate` and saves them in one transaction; a refused value answers 422 with the field's label, shows what was typed with the tab of the field's group open, and saves nothing. "Skip" (`action=skip`) saves nothing |
| `GET`, `POST /installer/client` | `client.astro` | The client files step: names `<assets.path>/dcr/` and lists `external_variables.txt` and `external_texts.txt` with their count of lines, or as missing. "Import client files" (`action=import`) imports both with `dcr.Import` in one transaction; "Skip" (`action=skip`) imports nothing. With a file missing, the page says where to put it, offers "Check again" (a link to the same page) and "Skip", and an import answers 422 and imports nothing |
| `GET`, `POST /installer/admin` | `admin.astro` | Habbo name, email, birth date, password, "Give this habbo Habbo Club" (ticked) and "Credits" (5000): one transaction creates, through `auth.CreateAccount`, the user, habbo, profile, home and wallet with the credits given, writes a club period of 100 years from now when the box is ticked, gives the habbo the staff badge `ADM`, and `HC1` with the club, and adds the user to the highest access group holding `housekeeping.accessGroups`; then redirects to `/` |

# The look

`layouts/setup.astro` draws every page: the hotel's logo and "Project Reborn installer" on the hotel's blue
(`sky-200`), over one box, `Card color="blue"`, whose title bar names the step. The theme's `--font-sans` is Holo's
Verdana, at the 16px base. A step's main button is `Button variant="green"`, "Skip" and "Check again" the default
variant, and an error a red `Notice` with `role="alert"`.

- One column: the page is 800px wide (`max-w-200`) with a 16px gutter, the box 768px, and every step fills its
  content, one column of 726px. The
  stepper, the text, the fields and the row of buttons share its left and right edges. Fields sit one under the other
  at the column's width.
- The steps are the shared `Stepper` with a `Step` each, drawn on the server in `layouts/setup.astro` with no client
  directive, in a `<nav aria-label="Steps">`, and they work with scripts off. The current step is `Step current`. Every
  page's data embeds `stepper`, whose `Waiting` is the first step that waits; around every other step the layout
  writes the Go condition `[[ if eq .Waiting ... ]]`, true when the step that waits is this one or one after it: then
  it is `Step href`, a link, else a plain `Step`, still to come. Once the hotel is installed, `Waiting` is empty and
  every step is plain.
- The row of buttons, `components/step-buttons.astro`, closes every step at the right end of the column: the way on
  ("Skip", "Check again"), then the main button. The main button comes first in the markup, so that Enter presses it,
  and the row is reversed. The row is `position: sticky` at the bottom, on a white band with a line above, so it stays
  in sight on a step taller than the screen.
- The settings step: its groups are panels in `#settings-groups`, each with `data-tab`, its title. The island
  `components/settings/settings-tabs.svelte` reads them and draws `Tabs color="blue"` with a `Tab` per panel, then
  hides every panel but the selected one with `hidden`: the panels stay in the one form, so every field posts. "More
  settings" is the last panel, its groups `<details>`, folded. The first panel holding `data-refused="true"`, the
  group of the field a refused save names (`settingsGroup.Refused`), opens first, and that group's `<details>` is
  open. With scripts off, every group shows framed, one under the other, then "More settings" under its heading.
- The shared `TabPanel` renders only the selected panel, which would take the hidden fields out of the form, so the
  settings step hides the server's panels itself. `TabList` puts its tabs at the right edge and does not wrap: the
  step passes `flex-wrap justify-start! px-0!`.

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
- The order of the steps lives in `setup.Steps`: config, site, settings, client, admin. A step that passes sends the browser to
  the next. A step opened before the one it follows redirects to the first step that waits, `(*State).Waiting()`; a
  step passed opens again. The config step passes once `config.json` exists; the others pass in memory, so a
  restarted installer continues at the site step. The status page's "Continue" links to the step that waits.
- Run alone, the config step opens the database before it writes `config.json`, so a path that cannot be opened leaves
  no `config.json`.
- Run alone, the config step writes every section it does not ask with its defaults: the CMS and housekeeping hosts as
  `localhost`, the proxy section disabled, the game server's ports, and the `reborn` section. A pod edits
  `config.json` to change them.
- The site step saves each key on its own and stops at the first error.
- The settings step draws a field by its `Kind`; the staff page's and credits page's box texts are multi-line. A
  switch posts a hidden `0` before its box, which posts `1` when ticked, and the last value counts. A field not posted
  keeps its value. The mail password shows empty, and an empty value keeps the saved one. The step saves a key that a
  rule ties to another after it, as housekeeping does when both password limits rise.
- A failure answers 500 and is logged, unless the visitor abandoned the request (`context.Canceled`): it ends quietly.
- Holo's ranks come from update `0003-ranks.sql`. On a new hotel the administrator joins Administrator; without a group
  holding `housekeeping.accessGroups`, the step fails with `setup.ErrNoGroup`.
- Only the client files step imports the client's files; the administrator step imports none. A step skipped leaves
  the tables empty, and housekeeping's Client Files page imports them later.
- The count of lines on the client files step counts the lines that are not empty, the ones `dcr.Import` saves.
- The administrator's first credits get a ledger row with the reason `registration` and the detail `installer`; 0
  credits get no row. The credits take the range of `registration.startCredits`, checked with `settings.Validate`: a
  value outside it, or no number, answers 422 and names "Credits".
- The administrator's club is one `club_subscriptions` row from now to 100 years from now, as a purchase writes one,
  with no payment and no ledger row. The site's `GetClubEnd` and the game's `ClubStatus` read it as a running club.
- The administrator's habbo wears the staff badge `ADM` in slot 1 and, with the club, the club badge `HC1` in slot 2.
  A slot holds one badge and `GrantAvatarBadge` wears in slot 1, so `HC1` is granted and moved to slot 2 before `ADM`
  is granted. The site shows `ADM`, the badge of the first slot.
- `New(ctx, db, opts...)` takes the database. reborn passes the one it opened, and the installer works on it and
  creates none. The runners of the installer alone pass `nil`, and the config step creates it.
- A restarted installer continues: with `nil`, `New` opens the database named by an existing `config.json`. That also covers a
  database another program created: the installer then changes its default values and creates the administrator, once.
- The installer never applies database updates.
- The installer reads each setting from the store when it uses it, with `settings.String`, `Int` and `Bool`, and saves
  with `settings.Set`. A setting with no row reads as its declared default
  (`knowledge/decisions/reborn/0006-settings-are-read-from-the-store.md`).
