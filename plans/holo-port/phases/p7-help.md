---
type: Phase
title: P7 Help
description: The help tool where habbos open a help ticket that staff handle in housekeeping.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p7, cms]
---

# Goal

A habbo can ask staff for help from the site.

# Scope

| Holo source | Routes | Astro pages | Composed UI |
| --- | --- | --- | --- |
| `iot/go.php` | `GET /help`, `POST /help` | `help.astro` | `help/help-form`; one request not yet picked up per habbo, post reports included, where Holo counted per address ([0090](/decisions/0090-post-reports.md)) |

The housekeeping side (`/housekeeping/help`) comes with [HK-B](/phases/hk-b-users-moderation.md).

# Exit criteria

- A ticket created on the site appears in the housekeeping queue and can be picked and closed.

# Tasks

Created when the phase starts.
