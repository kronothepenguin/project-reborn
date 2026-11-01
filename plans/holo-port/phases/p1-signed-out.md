---
type: Phase
title: P1 Signed-out site
description: Landing and login, registration with referrals, logout, forgot and reset password, legal pages and maintenance.
status: done
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [p1, cms]
---

# Goal

A visitor can register (optionally through a referral link), sign in with a habbo name, sign out and reset a
forgotten password. The landing, legal and maintenance pages match Holo's process template.

# Scope

| Holo source | Routes | Astro pages | Composed UI (`packages/cms/src/components/…`; ⚡ = island) |
| --- | --- | --- | --- |
| `index.php` | `GET /{$}`, `POST /{$}` | `index.astro` (exists) | `landing/login-box`, `landing/join-button` (the existing SVG), ⚡`landing/promo-widget` (`vendor/HabboWidgets/habbos_v2_landing`, `features.landingPromo`) |
| `xml/promo_habbos.php` | `GET /xml/promo-habbos.xml` | — | random habbos for the promo widget ([protocols](/reference/holo-protocols.md#promo-habbos-xml)) |
| `register.php`, `ajax_namecheck.php`, `ajax_emailcheck.php`, `ajax_password.php` | `GET /register`, `POST /register`, `POST /register/check-name` | `register.astro` (exists) | ⚡`register/name-check`, ⚡`habbo/avatar-editor` (wraps `public/habbo-editor.iife.js`) |
| `logout.php` | `GET /logout`, `POST /logout` | `logout.astro` | sign-out form on `/me` |
| `me.php`, minimal ([0031](/decisions/0031-p1-minimal-me-page.md)) | `GET /me` | `me.astro` | the active habbo and the sign-out form; P2 fills in the page |
| `forgot.php` (+ reset) | `GET/POST /forgot`, `GET/POST /reset/{token}` | `forgot.astro`, `reset/token.astro` | `packages/cms/internal/mail` (`net/smtp`) |
| `disclaimer.php`, `privacy.php` | `GET /disclaimer`, `GET /privacy` | `disclaimer.astro`, `privacy.astro` | `legal/terms` (text from `source/holo/locale/en/policies.php`) |
| `maintenance.php` | middleware | `maintenance.astro` | maintenance page with a login form for staff (built in [p0-11](/tasks/p0-11-cms-wiring.md); failed sign-ins in [p1-02](/tasks/p1-02-sign-in-and-out.md)) |

- Registration writes, in one transaction: the user, credentials, habbo, profile, home, wallet, the welcome
  transaction (`registration.startCredits`) and an optional referral (`referral.reward`). It enforces
  `registration.maxPerIp` per `registration.ipWindowHours`. An email that already exists gets "sign in and add a
  habbo".
- Settings: `registration.*`, `mail.*`, `imaging.*`, `referral.*`, `features.landingPromo`.
- Primitives: Checkbox, Select, Notice, Avatar, Icon (moved from `packages/cms/src/components/icon.svelte`).
- Queries: registration, referrals, the promo habbos, password resets.

# Exit criteria

- Register → automatic sign-in → sign out → sign in by habbo name → forgot → reset works end to end.
- A wrong password repeated until `auth.loginMaxFailures` is refused.
- Built pages keep their `[[ ]]` placeholders and their islands carry `client="only"`.
- Every page behaves as its Holo page does, and [the differences](/reference/holo-differences.md) list the rest
  ([0034](/decisions/0034-behaviour-matches-holo.md)).

# Tasks

- [p1-01 Add the P1 primitives](/tasks/p1-01-primitives.md) — done
- [p1-02 Sign in and sign out](/tasks/p1-02-sign-in-and-out.md) — done
- [p1-03 Move account creation into packages/auth](/tasks/p1-03-account-helpers.md) — done
- [p1-04 Build registration](/tasks/p1-04-registration.md) — done
- [p1-05 Pay referrals at registration](/tasks/p1-05-referrals.md) — done
- [p1-06 Reset a forgotten password by email](/tasks/p1-06-forgot-and-reset.md) — done
- [p1-07 Add the legal pages](/tasks/p1-07-legal-pages.md) — done
- [p1-08 Add the landing promo widget](/tasks/p1-08-landing-promo.md) — done
- [p1-09 Verify the P1 exit criteria](/tasks/p1-09-exit-check.md) — done
- [p1-10 Give the register page a title](/tasks/p1-10-register-page-title.md) — done
- [p1-11 Match the signed-out layout to Holo](/tasks/p1-11-signed-out-layout.md) — done
- [p1-12 Show Holo's sign-out and ban pages](/tasks/p1-12-sign-out-page.md) — done
- [p1-13 Match the forgot page to Holo](/tasks/p1-13-forgot-as-holo.md) — done
- [p1-14 Limit the reset mail](/tasks/p1-14-reset-mail-limit.md) — done
- [p1-15 Match the landing page to Holo](/tasks/p1-15-landing-as-holo.md) — done
- [p1-16 Match the registration rules and texts to Holo](/tasks/p1-16-registration-rules.md) — done
- [p1-17 Port Holo's registration flow to the browser](/tasks/p1-17-registration-flow.md) — done
- [p1-18 Verify P1 against Holo](/tasks/p1-18-exit-check-as-holo.md) — done
- [p1-19 Fix two texts found by the exit check](/tasks/p1-19-text-fixes.md) — done
- [p1-20 Delete expired reset links on a schedule](/tasks/p1-20-delete-expired-resets.md) — done
