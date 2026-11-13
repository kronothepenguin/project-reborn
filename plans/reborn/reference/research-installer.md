---
type: Reference
title: Research: a richer installer
description: How the installer works today, which seeds the code needs, and the options for a first news article, optional seeds, editing the catalogue during the installation and more settings in the wizard.
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [research, installer, store, settings]
---

A read-only study of 2026-11-12, made by a research agent for the [installer slice](/slices/installer.md). Nothing here
is decided: the slice lists the questions the user answers before any task is written.

# The installer today

- Routes: `packages/installer/installer.go`. Handlers: `packages/installer/internal/router/{index,config,site,admin,done,router}.go`.
  Install logic: `packages/installer/internal/setup/setup.go`. Pages: `packages/installer/src/pages/*.astro`. Runner:
  `apps/installer/cmd/installer/main.go`, on port 17306, behind `http.NewCrossOriginProtection`.
- Tests: one end-to-end test, `packages/installer/installer_test.go` `TestInstallation`, and
  `internal/setup/setup_test.go`.

| Step | Route | What it asks | What it writes, and when |
| --- | --- | --- | --- |
| Status | `GET /` | nothing | Nothing. It says "installed" once some user holds `housekeeping.accessGroups` |
| Config | `/config` | database path, hotel port, housekeeping port | `setup.Configure` calls `store.Open(path)`: the real database is created here, with every update and its seeds (`store.createIfNew`). Then `settings.Load`, then `config.Create` writes `config.json`. The server and proxy keys get defaults and are not asked |
| Site | `/site` | site name, short name, site URL, housekeeping address, start credits, secure cookies | Each value at once with `settings.Set(ctx, db, 0, key, v)`, one by one: no transaction and no `settings.Validate` first, so a rule that ties two settings together can fail halfway |
| Admin | `/admin` | habbo name, email, birth date, password twice | One transaction: `auth.CreateAccount` creates the user, habbo, profile, home, a wallet of 5000 credits and its ledger row; the admin joins the highest group holding `housekeeping.accessGroups` (Administrator, update 0003). This marks the hotel as installed |
| Done | `/done` | nothing | Shows the paths and links to `site.url` |

- "Installed" means `ListAttributeHolders("housekeeping.accessGroups")` returns at least one user. After that every step
  redirects to `/`. `/site` and `/admin` redirect to `/config` until `config.json` exists.
- There is no draft: the only state between steps is the real database and `setup.State`, which holds the config and
  the `*sql.DB` in memory. A restart resumes from `config.json` (`setup.Open`).
- A database another program created is accepted (`plans/holo-port/decisions/0047-every-program-works-on-an-empty-database.md`,
  `plans/holo-port/decisions/0068-seeds-are-updates.md`): the CMS may have started first, written a default
  `config.json` and created `hotel.db`. The installer never applies updates
  (`plans/holo-port/decisions/0070-housekeeping-applies-updates.md`).

# HoloCMS's install.php

- 875 lines. Step 1 asks for MySQL and the site path; step 2 seeds everything with no choices (`cms_system`,
  `cms_content`, 303 home store rows, two banners whose images are dead links); step 3 creates the admin with rank 7.
  It offered no optional content, no catalogue review and no other settings.
- It seeded a news article (line 417): num 2, title "Installation Complete", category "HoloCMS", a dead top-story image
  on images.habbohotel.com, the short story "Welcome, to your brand new HoloCMS installation!", a body that thanks for
  choosing HoloCMS, points to the RaGEZONE board and explains "Manage News Articles" in Housekeeping, the date
  `0000-00-00` and the author "Meth0d".
- `plans/holo-port/decisions/0075-no-news-or-banner-seeds.md` chose to seed no news and no banners. A first article
  reverses it, so a new decision has to supersede 0075.

# Seeds today

Rules (`plans/holo-port/reference/database-updates.md`, holo-port decisions 0067, 0068 and 0071): seeds are update
files, and a new database gets every update at once; a released update never changes, though nothing enforces it; seed
rows use fixed ids and `INSERT OR IGNORE`; an update never relies on values an admin can change; no current update is
marked `-- automatic`; each update applies in one transaction with foreign keys off and `PRAGMA foreign_key_check`
before the commit.

Row counts measured on a database built from the 21 updates:

| Update | Seeds | Rows | What the code needs from it |
| --- | --- | --- | --- |
| 0002 home-store | home store categories and items | 20 / 298 | Categories 27 (backgrounds) and 29 (notes) are constants in `packages/cms/seed/home-store.go`. The items are content |
| 0003 ranks | access groups and their attributes | 5 / 119 | Administrator is required (`setup.administratorsGroup` fails with `ErrNoGroup` without it). The other four are examples that can be deleted (holo-port 0054) |
| 0004, 0009 | attributes, Holo's fuses per level | | Required |
| 0010 navigator | categories, room models, public rooms; the file creates the tables and seeds them | 15 / 42 / 12 | Room models are required. Category 2 is `defaultRoomCategory` in `packages/server/game/rooms.go`, and the roots 3 and 4 are needed. Public rooms are content |
| 0013 catalogue | furni definitions, pages, items; the file creates the tables and seeds them | 1,256 / 67 / 1,275 | The `present_gen*` definitions (gifts), the recycler's furni, `post.it`, wallpaper, floor and landscape, and the page with the code `Recycler`, which the client reads. The rest is content |
| 0016 rollers | changes definitions 465 to 474 | | Changes rows by their seeded ids |
| 0020 recycler | 4 rewards pointing at furni 463, 464, 462 and 1279 | 4 | A foreign key to `furni_definitions`: it fails its check if Holo's furni is missing |
| news, banners | none (holo-port 0075) | 0 | |

What this means:

- Seeds cannot be made optional by skipping update files: 0010 and 0013 create the tables in the files that seed them,
  and 0016 and 0020 depend on the seeded ids.
- Every test database holds every seed, and server tests rely on it, for example furni 463.
- The game server loads furni and the catalogue once at start (`plans/server/decisions/0098-virtual-furni-and-catalogue.md`).
  Edits made during an installation are fine, because the server starts afterwards. An editor in housekeeping needs a
  way to tell a running server.
- `plans/server/decisions/0091-holos-catalogue-changed-by-updates.md` and the catalogue editor of
  [the furni slice](/slices/furni-and-catalogue.md) say the catalogue changes only through updates today, and that an
  editor's design is asked when its work starts. Editing at install time is that question.

# News

- Table `news_articles` (`packages/store/schema/news.schema.sql`): `avatar_id`, the author, which can be empty; title,
  category, `image_url` and `image_id`; summary and a BBCode body; `published_at`. `CreateNewsArticle` exists.
- The news card is `newsPromo` (`packages/cms/internal/router/community.go:120`), on `/me` and `/community`, with the
  template `packages/cms/src/components/news/news-promo.astro`. `/news` shows "No news to display yet." when empty. An
  article hides its author line when it has none.
- Housekeeping writes articles in `packages/housekeeping/internal/router/news.go`, with the categories of
  `newsCategories`. The default picture is `seed.DefaultTopStory`, `/web-gallery/images/top-story/top_story_news.png`,
  local, 300x187: a first article needs no new image.

Ways to a first article:

- N1, an update (`0022-welcome-news.sql`) with a fixed article. Its text cannot name the hotel, since an update must not
  use values an admin can change, and it has no author. Hotels that exist and have no news would get it too.
- N2, the installer writes it in its final write (the agent's recommendation): by the administrator's habbo, naming
  `site.name`, linking to housekeeping's news page, with `DefaultTopStory`, the category Announcements, published now,
  prefilled and editable, with a tick to skip it. Only new installations get it.

# Settings

- `packages/virtual/settings/catalogue.go` declares about 100 keys, each with a default and a validator, and three
  rules that tie settings together (password lengths, ping and its timeout, the recycler's session and its time-out).
  The API: `Load`, `Set`, which cannot join a transaction, `Validate(map)`, all or nothing, and `Declared()`.
- Housekeeping's forms are in `packages/housekeeping/internal/router/sections.go`: `forms` gives each field its label
  and help, and `sectionsOver`, `filled` and `readChanges` build and read them. Saving validates first. All of it is
  under `internal`, so the installer cannot import it today.

Settings an admin would plausibly set while installing:

1. Hotel, asked today: `site.name`, `site.shortName`, `site.url`, `site.housekeepingUrl`, `auth.secureCookies`.
2. New players: `registration.startCredits`, `registration.defaultFigure`, `registration.defaultGender`,
   `referral.enabled`, `referral.reward`.
3. Mail, without which password resets do nothing: `mail.host`, `mail.port`, `mail.username`, `mail.password`,
   `mail.from`.
4. Avatar pictures: `imaging.avatarUrl`, which defaults to habbo.com, an outside service.
5. Site features: the `features.*` toggles and `recycler.enabled`.
6. Prices: `club.price1Month`, `club.price3Months`, `club.price6Months`, `groups.price`.
7. Game ads: `game.loadingAdImage`, `game.loadingAdLink`, `game.roomAdImage`, `game.roomAdLink`.

Everything else would go under "More settings". The config step could also ask for the game server's ports
(`server.info`, `server.mus`), written as defaults today.

# Options

## Optional seeds

- A1, seed everything, then remove what the admin unticked, inside the final write (recommended). Packs: catalogue
  content, public rooms, home store items, example ranks, recycler rewards. Rows the code needs always stay. The choice
  is recorded once in a new table, such as `content_packs(name, kept)`, and later content updates insert only where
  their pack was kept. Small. A hotel that exists has no rows there, which means everything kept: it behaves as today.
- A2, mark seed updates `-- optional <pack>` and skip them. Not possible for 0010 and 0013, which also create the
  tables, and 0020 would fail its foreign-key check. It works only for future seed-only updates.
- A3, content packs outside the update chain, with new databases built from the schema files and a baseline mark. Large:
  it reverses holo-port 0068, needs 0001 to 0021 squashed, and every content change would ship twice.

Under A1 the writing rules gain one: a content update inserts only where its pack is kept, and never overwrites columns
an admin can edit, such as a price or a name, on seeded rows.

## Editing the catalogue before anything is written

- B1, a draft database (recommended). The config step creates a draft file, such as `<db>.install`, with every update
  applied. Packs, catalogue edits, settings and the article go into the draft. At "Install", the installer opens or
  creates the real database, attaches the draft and applies the differences in one transaction, writes `config.json`
  last and deletes the draft. Lists run as real SQL with pages, filters and sorting, through new queries, which an
  editor in housekeeping can reuse later. It survives a restart of the installer, and works when the CMS created the
  database first. Medium.
- B2, the real database as today, with edits waiting in memory, laid over every read and applied at the end. The
  overlay is error-prone with filters, sorting and paging; edits are lost on a restart; the database exists early.
- B3, no editing while installing: a catalogue editor in housekeeping, linked from the done page. The editor is needed
  anyway, and hotels that exist get it too, but it needs the server to reload while it runs, and it is not "before
  writing".

A scope for the editor at install time: items (name, description, price, page, position, remove); pages (name, order,
`min_level`, `open_to_club`, `club_only`, remove); furni (`tradeable` and `recyclable` only, since sprite, kind and
sizes must keep matching the client). Filters: page, text in name or sprite, price range, level, club. Sorting: name,
price, page, position. 50 a page over 1,275 items.

## More settings in the wizard

- C1, a shared labelled layout moved out of housekeeping's `internal`, used by both programs (recommended). The wizard
  shows the chosen groups and "More settings", and writes through `settings.Validate`, which also fixes today's
  one-by-one saving.
- C2, the installer hand-writes more fields, as `/site` does. Cheap now; labels and help drift apart.
- C3, a generic form straight from `settings.Declared()`. Cheapest; its labels are raw keys.

# Risks

- Removing a pack must keep every row the code needs: a store test should build "all packs removed" and check the gift
  boxes, the recycler's furni and page, categories 2, 3 and 4, home store categories 27 and 29, and Administrator.
- Future updates that change seeded rows, as 0016 did, could overwrite an admin's edits.
- A CMS started during the installation creates the real database with a default `config.json`. The final write must
  copy into a database that exists, or refuse, and never create a second administrator.
- Settings are global to the process: switching from the draft to the real database must reload them.
- The installer is a known way to attack a hotel (holo-port 0070): the draft must go once the hotel is installed.
- Not verified: that the navigator works with no public rooms.

# Suggested tasks

1. Decisions: supersede holo-port 0075; amend holo-port 0068 and 0070 for packs, edits and the article; record the draft
   database and the shared settings layout.
2. store: the pack record table with its update, schema file and concepts; queries that remove packs, list catalogue
   items, pages and definitions with filters, sorting and paging, and write the edits; a test that "all packs removed"
   keeps the required rows.
3. installer (`internal/setup`): the draft's life, the final write, the resume after a restart, tests.
4. virtual/settings, or the place chosen, and housekeeping: move the settings layout and its parsing; housekeeping's
   pages stay identical.
5. installer pages, in order: settings groups, content packs, catalogue review, welcome article, administrator, review
   and install, done; both READMEs.
6. installer and cms: the welcome article in the final transaction, with `seed.DefaultTopStory`; check `/me`,
   `/community` and `/news`.
7. installer: the game server's ports in the config step.
8. server: a hotel with every pack removed still starts and works (navigator without public rooms, empty catalogue,
   gifts, recycler).
9. Later: the catalogue editor in housekeeping, reusing the queries of task 2, with the server's reload.

# Questions for the user

Each with the agent's recommendation first.

1. Where do choices wait until "Install"? In a draft copy of the database beside the real one, so a restart keeps
   them; or in memory, so a restart starts over. Example: 40 prices edited, the installer crashes; with the draft the
   40 prices are still there.
2. What does "not seeded" mean? Everything is seeded in the draft and what is unticked is removed before the real
   write; skipping seed files is not possible for the catalogue and the navigator. Example: unticking Catalogue leaves
   the shop empty but for the Recycler page and the gift boxes the code needs.
3. Which packs are optional? Catalogue content (67 pages, 1,275 items), public rooms (12), home store items (298),
   example ranks (Moderator, Gold Hobba, Silver Hobba, HabboX), recycler rewards (4). Always kept: Administrator, room
   models, the navigator's roots, home store categories 27 and 29, the furni the code uses.
4. A later release adds content to a pack that was skipped: is it added? No, it follows the choice; or yes. Example:
   the release that brings the Trax pages, for a hotel that skipped the catalogue.
5. What can be edited in the catalogue at install time? Items, pages and the two furni flags, as listed above; or also
   sprite, size and kind. Example: a Throne goes from 25 to 100 credits, and cannot become another picture.
6. Edit during the installation, or right after in housekeeping? During, on the draft, with the queries reused later by
   an editor in housekeeping; or only that editor, linked from the done page.
7. What if the CMS created the database before the installer finished? The installer writes the choices into it in one
   transaction; or it refuses and asks for the file to be deleted.
8. Who writes the welcome article? The installer, as the administrator's habbo, titled "Welcome to <hotel name>!",
   prefilled, editable and skippable; or an update with fixed text and no author, which older hotels without news
   would also get. Either way it replaces holo-port 0075.
9. Banners too? No, only the article; or Holo's two banners with new local pictures.
10. Which settings does the wizard show? The seven groups above and "More settings" with every other one; only the
    seven groups; or every setting. Example: the mail server set while installing makes password resets work on day
    one.
11. Where does the shared settings layout (labels, help, kinds of field) live? In `packages/virtual/settings`, beside
    the declarations; or a new package the user names.
12. Does the config step ask for the game server's ports? Yes.
