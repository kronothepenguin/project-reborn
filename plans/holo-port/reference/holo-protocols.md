---
type: Reference
title: Holo formats and protocols
description: MUS commands, SSO tickets, group badge codes, promo habbo XML, figure strings, BBCode and the captcha as Holo used them.
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [holo, protocols]
---

# MUS

`source/holo/includes/mus.php` `SendMUSData` opened one TCP connection per command to the emulator
(`cms_system.ip` and the `mus_port` key), wrote a 4-character opcode followed by fields separated by `chr(2)`, and
closed without reading. Deferred with the game server ([0013](/decisions/0013-defer-game-server-features.md)).

| Opcode | Payload | Meaning | Holo callers |
| --- | --- | --- | --- |
| `UPRC` | user id | refresh credits | givecredits, edituser, GiveHC, grouppurchase, redeemvoucher, store, club_subscribe |
| `UPRS` | user id | refresh club status and badges | badgetool, edituser, GiveHC / IsHCMember |
| `UPRA` | user id | refresh look, gender and motto | edituser, account, update_motto |
| `UPRH` | user id | refresh inventory | redeemvoucher (item vouchers) |
| `HKMW` | user id, text | moderator alert | alert, massalert |
| `HKSB` | user id, reason | ban notice and disconnect | bantool |

# SSO tickets

Holo: `"ST-" + 6 digits + "-" + 20 digits + "-holo-fe" + digit` from `rand()`, stored in `users.ticket_sso` and reused
until a ban cleared it; passed to the client as `sso.ticket`. New: a random token per visit to `/client`, stored as a
digest in `sso_tickets` with the IP and a short expiry, redeemed once by the game server (deferred).

# Group badges

Code format (`habbo-imaging/badge.php`): remove every `b` and `X`, split on `s`.

- Part 0: base `BBCC` — two-digit shape (01–24), two-digit colour.
- Parts 1–4: symbol `TTCCP` — two-digit template (01–67), two-digit colour, one-digit position.
- Positions form a 3×3 grid: `0 1 2 / 3 4 5 / 6 7 8`.
- Default: `b0503Xs09114s05013s05015` (base 05 in colour 03, symbol 09 in white at the centre, symbol 05 in yellow
  at the middle left and middle right).
- Rendering: 39×39 canvas; each layer `badges/base/BB.gif` or `badges/templates/TT.gif` is recoloured to
  `(avg(r,g,b) / 255) × tint`; an overlay `NN_NN.gif`, when present, is drawn on top uncoloured.
- Holo wrote the cache file name straight from the request (path traversal); the new renderer validates the code
  strictly.

| Code | Tint | Code | Tint | Code | Tint |
| --- | --- | --- | --- | --- | --- |
| 01 | ffd601 | 07 | ff98e3 | 13 | 373737 |
| 02 | ee7600 | 08 | f334bf | 14 | fbe7ac |
| 03 | 84de00 | 09 | ff2d2d | 15 | 977641 |
| 04 | 589a00 | 10 | af0a0a | 16 | c2eaff |
| 05 | 50c1fb | 11 | ffffff | 17 | fff165 |
| 06 | 006fcf | 12 | c0c0c0 | 18 | aaff7d |

# Promo habbos XML

The landing widget (`vendor/HabboWidgets/habbos_v2_landing`) accepts either shape:

```xml
<habbos>
  <habbo image="https://imager.example/avatarimage?figure=..." />
</habbos>
```

```xml
<habbos url="https://imager.example/avatar/">
  <habbo gender="m" figure="..." hash="..." />
</habbos>
```

Holo's `xml/promo_habbos.php` returned 10 random users with name, motto, avatar URL, badge, online status and group
badge, without escaping attributes.

# Figure strings

- Dot format (`hd-180-1.ch-215-82.lg-270-82`): written by the v2 avatar editor
  (`packages/cms/public/habbo-editor.iife.js`, `vendor/HabboWidgets/habbo-registration/version-2.0`) and stored in
  `avatars.figure`.
- Holo's `xml/figuredata.xml`, `draworder.xml`, `partsets.xml` and `animation.xml` describe the parts; Holo itself
  never used them (it pointed the Flash editor at habbohotel.co.uk). They are inputs for a future own imager.

# BBCode

Holo's `bbcode_format()` (`core.php:195-243`) supported `[b] [i] [u] [s] [quote] [link=] [url=] [color=]
[size=small|large] [code]` and smilies, without URL sanitizing. The new renderer (`packages/cms/internal/bbcode`)
keeps these tags, escapes everything else, allows only http(s) links and maps colours to
[Tailwind classes](/reference/colours.md#bbcode).

# Captcha

`captcha/CaptchaSecurityImages.php` generated a JPEG code stored in the session, but registration never checked it.
Dropped in favour of a per-IP registration limit ([0021](/decisions/0021-dropped-and-kept-features.md)).
