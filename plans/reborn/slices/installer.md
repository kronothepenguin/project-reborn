---
type: Slice
title: Installer: a first article, optional content and more settings
description: A new hotel starts with a first news article, and its administrator chooses which content is seeded, reviews the catalogue and sets more of the hotel's settings while installing.
status: planned
projects: [installer, store, cms, housekeeping, virtual]
depends_on: []
from: []
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [installer, store, settings]
---

# Goal

The installer does what a hotel of today's size needs.

The user: "after installation i would like to have a news article, because the news card feels empty today."

The user: "i would like to enhance the installer now that we have complex rules. as example, i would be cool to allow
the admin during the installation to seed or not to seed optional stuff like the furnis, and allow them to edit (using
pagination, filters and sorting) the catalogue or furnis during installation as an optional step before writing to the
database. admin can skip or modify as they want. as well as some settings during installation, currenlty we have hotel
name and site only, but would be cool to allow the admin to show up other settings and modify them during the
installation."

# Scope

| Project | Part |
| --- | --- |
| `packages/installer` | New steps: settings in groups, content to keep, a review of the catalogue with pages, filters and sorting, the welcome article; one final write |
| `packages/store` | What records the content that was kept; queries that list and edit the catalogue |
| `packages/virtual`, `packages/housekeeping` | The settings' labels and help shared with the installer, where housekeeping's forms hold them today |
| `packages/cms` | The first article shows on `/me`, `/community` and `/news` |
| `packages/server` | A hotel with optional content removed still starts and works |

[The study](/reference/research-installer.md) recommends: the installer writes the first article as the administrator's
habbo; everything is seeded in a draft copy of the database and what the administrator unticks is removed before the
real write, since the updates that seed the catalogue and the navigator also create their tables; edits to the catalogue
go to that draft; and the settings' labels are shared with housekeeping.

A first article replaces `plans/holo-port/decisions/0075-no-news-or-banner-seeds.md`, and optional content amends
`plans/holo-port/decisions/0068-seeds-are-updates.md`: each needs its decision when the slice starts. The place of the
installer on the orchestrator's mux is [platform](/slices/platform.md)'s.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- The twelve questions of [the study](/reference/research-installer.md#questions-for-the-user): where choices wait until
  "Install", what "not seeded" means, which content is optional, what a later release does for content that was skipped,
  what can be edited, during the installation or after it, a database the site already created, who writes the article,
  banners, which settings, where their labels live, the game server's ports.
