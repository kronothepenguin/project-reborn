---
type: Phase
title: P2 Me and account
description: The community layout and header, the Me page, account settings and owning several habbos.
status: active
timestamp: 2026-11-01T18:13:48+00:00
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

- Email and password changes ask for the current password and the birth date, as Holo does: the plan dropped the birth date,
  and [0034](/decisions/0034-behaviour-matches-holo.md) brought it back. A password change ends every session, because Holo
  says `You will need to login again.`
- Layout grids: 460/310/160 (`body#home`) and 210/560/160 (`#news`, `#tags`); see
  [pages](/reference/holo-pages.md).
- `/account/looks` listens to the editor as Holo's `settings.js` does: `setAllowedToProceed` disables the save button, and
  `showHabboClubNotice` and `showOldFigureNotice` show their notices. `/register` must not, as `registration.js` does not.
- The header's habbo search leads to `GET /home?name=`, which waits for the deferred [P3](/phases/p3-homes.md)
  ([0045](/decisions/0045-homes-deferred.md)).
- Primitives: Spinner. Textarea waits for its first use.
- During maintenance, staff who pass see Holo's `Alert: The site is currently turned off!` in the header and the footer.
- The signed-out footer shows `Housekeeping` to staff, as Holo's does.
- Settings: `features.birthdayNotifications`, `registration.maxHabbosPerUser`, `site.housekeepingUrl`.

# Exit criteria

- Header states for guests and signed-in users render; the Housekeeping tab only shows with the attribute.
- Motto edit, alert dismiss, looks change, email and password change, and adding and switching habbos work.

# Tasks

- [p2-01 Delete expired sessions on a schedule](/tasks/p2-01-delete-expired-sessions.md) — done
- [p2-02 Build the community layout](/tasks/p2-02-community-layout.md) — done
- [p2-03 Build the Me page](/tasks/p2-03-me-page.md) — done
- [p2-04 Build the account pages' frame and Looks](/tasks/p2-04-account-looks.md) — done
- [p2-05 Build the motto, email, password and referral tabs](/tasks/p2-05-account-details.md) — done
- [p2-06 Own several habbos](/tasks/p2-06-several-habbos.md) — done
- [p2-07 Verify the P2 exit criteria](/tasks/p2-07-exit-check.md) — todo
