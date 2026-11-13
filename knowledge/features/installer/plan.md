---
type: Plan
title: "Installer: a first article, optional content and more settings: how"
description: The installer gains steps for settings, optional content, a catalogue review and a first article, written once.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/installer` | The status, config, site, administrator and done pages; `internal/setup` writes `config.json`, creates the database and the administrator (`packages/installer/knowledge/steps.md`) |
| `apps/installer` | The runners on `localhost:17306`, with cross-origin protection |
| `packages/store` | `store.Open` creates a new database with every update; `0003-ranks.sql` seeds Holo's ranks |
| `packages/auth` | `CreateAccount` and the rules for habbo names, emails, birth dates and passwords |
| `tests/e2e` | The `together` suite walks the installer's forms, then the CMS and housekeeping |

Planned:

| Project | Part |
| --- | --- |
| `packages/installer` | New steps: settings in groups, content to keep, a review of the catalogue with pages, filters and sorting, the welcome article; one final write |
| `packages/store` | What records the content that was kept; queries that list and edit the catalogue |
| `packages/virtual`, `packages/housekeeping` | The settings' labels and help shared with the installer, where housekeeping's forms hold them today |
| `packages/cms` | The first article shows on `/me`, `/community` and `/news` |
| `packages/server` | A hotel with optional content removed still starts and works |

[The study](/features/installer/research-installer.md) recommends: the installer writes the first article as the
administrator's habbo; everything is seeded in a draft copy of the database and what the administrator unticks is
removed before the real write, since the updates that seed the catalogue and the navigator also create their tables;
edits to the catalogue go to that draft; and the settings' labels are shared with housekeeping.

A first article replaces [holo-port 0075](/decisions/holo-port/0075-no-news-or-banner-seeds.md), and optional content
amends [holo-port 0068](/decisions/holo-port/0068-seeds-are-updates.md): each needs its decision when the feature
starts. The place of the installer on the orchestrator's mux is [platform](/features/platform/spec.md)'s.

# Decisions

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

The user's decisions are written here when the feature is planned.
