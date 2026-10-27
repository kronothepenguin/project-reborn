---
type: Decision
title: Dropped and kept Holo features
description: The captcha, the Dutch and German texts and Holo's admin database tools are dropped; tag fight and refer-a-friend are ported.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [scope]
---

# Decision

- Dropped:
  - the registration captcha, replaced by `registration.maxPerIp` registrations per `registration.ipWindowHours`;
  - the nl and de locales;
  - housekeeping `dbquery`, `dbrepair` and `dboptimize`;
  - the static HoloCMS, credits and help pages of housekeeping;
  - `install.php`, `upgrade.php` and the debug pages;
  - the IE stylesheets;
  - the Flash files, replaced by the `vendor/HabboWidgets` ports.
- Ported: tag fight, and refer-a-friend implemented for real (`referrals` table, `referral.reward` credits).
- Not ported, because Holo only had UI stubs: minimail, friend management, guestbook, ratings, highscores and
  traxplayer.

# Context

Holo's captcha never ran (the form field name was mangled), its referral link was advertised but never read, and
its database tools ran raw SQL as the database root user.
