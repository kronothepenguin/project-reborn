---
type: Phase
title: P1 Signed-out site
description: Landing and login, registration with referrals, logout, forgot and reset password, legal pages and maintenance.
status: planned
timestamp: 2026-10-27T20:48:19+00:00
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
| `logout.php` | `POST /logout` | — | sign-out form |
| `forgot.php` (+ reset) | `GET/POST /forgot`, `GET/POST /reset/{token}` | `forgot.astro`, `reset/token.astro` | `packages/cms/internal/mail` (`net/smtp`) |
| `disclaimer.php`, `privacy.php` | `GET /disclaimer`, `GET /privacy` | `disclaimer.astro`, `privacy.astro` | `legal/terms` (text from `source/holo/locale/en/policies.php`) |
| `maintenance.php` | middleware | `maintenance.astro` | maintenance page with a login form for staff |

- Registration writes, in one transaction: the user, credentials, habbo, profile, home, wallet, the welcome
  transaction (`registration.startCredits`) and an optional referral (`referral.reward`). It enforces
  `registration.maxPerIp` per `registration.ipWindowHours`. An email that already exists gets "sign in and add a
  habbo".
- Config sections: `registration`, `mail`, `imaging`, `referral`, `features.landingPromo`.
- Primitives: Checkbox, Select, Notice, Avatar, Icon (moved from `packages/cms/src/components/icon.svelte`).
- Queries: registration, referrals, the promo habbos, password resets.

# Exit criteria

- Register → automatic sign-in → sign out → sign in by habbo name → forgot → reset works end to end.
- A wrong password repeated until `auth.loginMaxFailures` is refused.
- Built pages keep their `[[ ]]` placeholders and their islands carry `client="only"`.

# Tasks

Created when the phase starts.
