---
type: Phase
title: P7 Help
description: The help tool where habbos open a help ticket that staff handle in housekeeping.
status: active
timestamp: 2026-11-09T18:04:21+00:00
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

- A visitor who is not signed in is sent to sign in ([0108](/decisions/0108-help-asks-visitors-to-sign-in.md)).
- The subject takes 50 characters and the question `help.messageMaxLength`, 65535 by default, both checked by the
  server ([0109](/decisions/0109-help-request-lengths.md)).

# Exit criteria

- A ticket created on the site appears in the housekeeping queue and can be picked and closed.

# Tasks

1. [p7-01 Declare the help setting](/tasks/p7-01-help-setting.md) — done
2. [p7-02 Send help requests from the Help Tool window](/tasks/p7-02-help-requests.md)
3. [p7-03 Verify P7](/tasks/p7-03-exit-check.md)
