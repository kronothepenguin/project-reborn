---
type: Plan
title: "Installer: a first article, optional content and more settings: how"
description: The installer writes config.json, the database and the first administrator, and gains steps for settings, optional content, a catalogue review and a first article, written once.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/installer` | The status, config, site, client files and administrator pages; `internal/setup` writes `config.json`, creates the database and the administrator (`packages/installer/knowledge/steps.md`) |
| `apps/installer` | The runners on `localhost:17306`, with cross-origin protection |
| `packages/store` | `store.Open` creates a new database with every update; `0003-ranks.sql` seeds Holo's ranks |
| `packages/auth` | `CreateAccount` and the rules for habbo names, emails, birth dates and passwords |
| `tests/e2e` | The `together` suite walks the installer's forms, then the CMS and housekeeping |
| `packages/settings` | `Group`, `Field` and `Groups()`: the labels and help of every setting an administrator edits |
| `packages/housekeeping` | The settings page reads `settings.Groups()`; the mail group is "Password reset mail" |

Planned:

| Project | Part |
| --- | --- |
| `packages/installer` | The optional settings step, between the site step and the client files step |
| `packages/installer` | Later: content to keep, a review of the catalogue with pages, filters and sorting, the welcome article; one final write |
| `packages/store` | What records the content that was kept; queries that list and edit the catalogue |
| `packages/cms` | The first article shows on `/me`, `/community` and `/news` |
| `packages/server` | A hotel with optional content removed still starts and works |

[The study](/features/installer/research-installer.md) recommends: the installer writes the first article as the
administrator's habbo; everything is seeded in a draft copy of the database and what the administrator unticks is
removed before the real write, since the updates that seed the catalogue and the navigator also create their tables;
edits to the catalogue go to that draft; and the settings' labels are shared with housekeeping.

A first article replaces [holo-port 0075](/decisions/holo-port/0075-no-news-or-banner-seeds.md), and optional content
amends [holo-port 0068](/decisions/holo-port/0068-seeds-are-updates.md): each needs its decision when the feature
starts. The place of the installer on the orchestrator's mux is [platform](/features/platform/spec.md)'s.

## The two optional steps

The steps run in this order: address, site, settings, client files, administrator. "Create administrator" stays the
last click, since the hotel counts as installed once the administrator exists and reborn then serves the site.

The shape the user approved on 2026-11-23:

```go
// packages/settings

// Group is a set of settings an administrator edits together.
type Group struct {
    ID     string // "registration"
    Title  string // "Registration"
    Fields []Field
}

type Field struct {
    Key      string // "registration.maxPerIp"
    Label    string // "Habbos Per Address"
    Help     string
    Kind     string // text, number, switch, choice
    Choices  []Choice
    Required bool
}

// Groups lists every group, in housekeeping's order.
func Groups() []Group
```

- Housekeeping keeps what is its own, by group and by key: Holo's page titles, menu names and button texts, the words
  of a switch, a multi-line text and the BBCode editor.
- The settings step shows these keys open, in six groups:
  - New players: `registration.defaultFigure`, `registration.defaultGender`, `referral.enabled`, `referral.reward`.
  - Password reset mail: `mail.host`, `mail.port`, `mail.username`, `mail.password`, `mail.from`.
  - Avatar pictures: `imaging.avatarUrl`.
  - Site features: the `features.*` switches and `recycler.enabled`.
  - Prices: `club.price1Month`, `club.price3Months`, `club.price6Months`, `groups.price`.
  - Game ads: `game.loadingAdImage`, `game.loadingAdLink`, `game.roomAdImage`, `game.roomAdLink`.
- "More settings" holds every other field of `settings.Groups()`, folded, under its group's title. The settings of the
  site step stay there and are left out: the names, the addresses, the start credits and secure cookies. The switches
  that close the site and the hotel are left out too.
- The step saves the changed settings together, after `settings.Validate` accepts them all.
- Built: the client files step reads `<assets.path>/dcr/`, as the administrator step did, and imports with `dcr.Import`;
  the administrator step imports none. `setup.Steps` holds the order of the steps.
  Downloading the files joins this step with [assets](/features/assets/spec.md).

# Decisions

Of 2026-11-23, each the user's choice among options put to them.

- The two steps come before the administrator step, each with "Skip" ("Before the administrator").
- The client files step shows the folder and what it found, with "Import client files", "Skip" and, with a file
  missing, "Check again" ("Import or skip").
- The settings step shows the day-one groups open and the rest folded ("Day-one groups, plus the rest folded"). It
  answers question 10 of [the study](/features/installer/research-installer.md#questions-for-the-user).
- The labels and help live in `packages/settings` ("In packages/settings"). It answers question 11 of the study.
- Housekeeping's "Mail" form becomes "Password reset mail" ("Rename it"). The user had asked why housekeeping holds a
  mail server: it sends the "Forgot your password?" link, as Holo's `forgot.php` sent a mail
  ([0018](/decisions/holo-port/0018-password-reset-by-email.md)). The minimail is messages between habbos kept in the
  database, apart from it and still to build.
- The administrator step offers Habbo Club for the administrator's habbo, ticked by default, as a period of 100 years
  ("A tick box, club for good"). The user: "can we give habbo club to the admin in the installer?"
- The administrator's first credits are a field of the administrator step, filled with Holo's 5000 ("A field on the
  administrator step"). The user had asked: "the initial config was set credits to 500, but the admin starts with
  5000, why?" The 500 is `registration.startCredits`, for habbos who register; the 5000 was fixed by
  [0026](/decisions/holo-port/0026-installer-administrator-and-names.md), which this replaces for the number alone.
- A step's progress lives in memory while the installer runs: a restarted installer goes on from the site step.

Earlier:


- [Installer administrator, start credits and habbo
  names](/decisions/holo-port/0026-installer-administrator-and-names.md) — The site step sets
  `registration.startCredits`; the administrator gets Holo's figure and 5000 credits; habbo names take letters, digits
  and `- = ? ! @ : . ,` up to 24 characters.
- [Access groups are Holo's ranks](/decisions/holo-port/0054-access-groups-are-holos-ranks.md) — A new hotel has Holo's
  staff ranks as access groups, and the first administrator joins Administrator.
- [Seeds are updates, and a new database gets every update](/decisions/holo-port/0068-seeds-are-updates.md) — The
  installer works on an empty database or on one another program created, and changes the defaults once.
- [Inside reborn the installer lives under /installer/](/decisions/reborn/0004-the-installer-inside-reborn.md) — Run
  alone, the installer keeps its form with both ports and the Housekeeping Address; it refuses to run once an
  administrator exists, never applies updates, and its "already installed" page links to `site.url`.
