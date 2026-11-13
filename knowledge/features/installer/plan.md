---
type: Plan
title: "Installer: a first article, optional content and more settings: how"
description: The installer gains steps for settings, optional content, a catalogue review and a first article, written once.
---

# Architecture

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

The user's decisions are written here when the feature is planned.
