---
type: Phase
title: P2 Me and account
description: The community layout and header, the Me page, account settings and owning several habbos.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p2, cms]
---

# Goal

A signed-in user sees Holo's community chrome, their Me page and account settings, and can add and switch habbos.

# Scope

| Holo source | Routes | Astro pages | Composed UI (⚡ = island) |
| --- | --- | --- | --- |
| `templates/community/*` | — | `layouts/community.astro` | `header/main-tabs` (Housekeeping tab with `housekeeping.access`), `header/sub-tabs`, `header/user-menu` (active habbo, switch, sign out), `header/mini-login` (guests), `header/habbo-search` → `GET /home?name=` |
| `me.php`, `update_motto.php`, `removefeeditem.php` | `GET /me`, `POST /me/motto`, `POST /me/alerts/{id}/dismiss` | `me.astro` | `me/personal-info`, ⚡`me/motto-editor`, ⚡`me/feed` (alerts, birthday, last sign-in, help-ticket count with `housekeeping.help`) |
| `account.php` tabs 1–5 | `GET/POST /account/looks`, `/account/profile`, `/account/email`, `/account/password`, `GET /account/referral` | `account/{looks,profile,email,password,referral}.astro` | `account/settings-nav`, ⚡`habbo/avatar-editor` |
| new (one user, many habbos) | `GET /account/habbos`, `POST /account/habbos`, `POST /account/habbos/{id}/switch` | `account/habbos.astro` | ⚡`habbo/avatar-editor`; limit `registration.maxHabbosPerUser` |

- Email and password changes require the current password; Holo's birth-date question is dropped. A password change
  ends the other sessions.
- Layout grids: 460/310/160 (`body#home`) and 210/560/160 (`#news`, `#tags`); see
  [pages](/reference/holo-pages.md).
- Primitives: Textarea, Bubble, Spinner.
- Settings: `features.birthdayNotifications`.

# Exit criteria

- Header states for guests and signed-in users render; the Housekeeping tab only shows with the attribute.
- Motto edit, alert dismiss, looks change, email and password change, and adding and switching habbos work.

# Tasks

Created when the phase starts.
