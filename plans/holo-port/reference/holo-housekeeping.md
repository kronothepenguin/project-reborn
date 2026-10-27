---
type: Reference
title: Holo housekeeping
description: Holo's admin panel pages, its access model, staff log, layout and risky features, and where each part goes.
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [housekeeping, holo]
---

# Routing and access in Holo

- `source/holo/housekeeping/index.php` routes by `?p=<page>&do=<action>&key=<id>`; unknown pages go to the
  dashboard.
- Login (`login.php`) required `rank > 5` and stored `acp`, `hkusername` and the password hash in the PHP session
  shared with the site. Every request re-checked name, hash and rank.
- Rank 6 = moderator, rank ≥ 7 = administrator, `$sysadmin` (a user id in `config.php`) for database tools, log
  pruning and granting rank 7. The actor id came from the site session, not the housekeeping one.
- No CSRF protection; several state changes ran on GET links.

New model: shared session, attributes per user ([0014](/decisions/0014-attribute-based-access.md)), routes under
`/housekeeping` ([0003](/decisions/0003-housekeeping-under-prefix.md)), every mutation logged.

# Pages

| Holo `?p=` | What it did | New route (under `/housekeeping`) | Attribute | Phase |
| --- | --- | --- | --- | --- |
| dashboard | counts, emulator settings, admin list, shared notes | `GET /{$}`, `POST /note` | `housekeeping.access` | HK-A |
| site (`cms_config.php`) | site name, short name, SSO, language | `GET /settings`, `POST /settings/{section}` | `housekeeping.settings` | HK-A |
| maintenance | site on/off | settings form | `housekeeping.settings` | HK-A |
| loader | client loader values | deferred | — | — |
| content (`content_tool.php`) | `cms_content` editor | settings forms (`staffPage`, `creditsPage`, `features`) | `housekeeping.settings` | HK-A |
| ranktool | set rank 1–7 | `/access-groups…`, `POST /users/{id}/access-groups` | `housekeeping.accessGroups` | HK-A |
| logs | staff log, prune by GET | `GET /logs` (read-only) | `housekeeping.logs` | HK-A |
| users, ip, uid, clonechecker | user list, IP and id lookup, same-IP accounts | `GET /habbos?q=`, `GET /habbos/{id}` | `housekeeping.users` | HK-B |
| edituser | edit any column (POST picked column names) | `POST /habbos/{id}`, `POST /users/{id}` (allow-list) | `housekeeping.usersEdit` | HK-B |
| badgetool | give or wear badge | `POST /habbos/{id}/badges`, `…/badges/{code}/delete` | `housekeeping.usersEdit` | HK-B |
| givecredits, transactions | credits by name, ledger | `POST /habbos/{id}/credits`, `GET /habbos/{id}/transactions` | `housekeeping.credits` | HK-B |
| ban, unban, banlist | ban by id with string date math; mass unban by free text | `GET /bans`, `POST /bans`, `POST /bans/{id}/lift` | `housekeeping.bans` | HK-B |
| alert, massalert, alertlist | `cms_alerts` row per user, optional MUS alert | `GET /alerts`, `POST /alerts` | `housekeeping.alerts`, `housekeeping.alertsBroadcast` | HK-B |
| helper | help queue pick, delete, quick reply | `GET /help`, `POST /help/{id}/pick`, `POST /help/{id}/close` | `housekeeping.help` | HK-B |
| add_homes | add store item by remote URL, appended CSS | `/home-store…` | `housekeeping.homeStore` | P3 |
| news_compose, news_manage | news CRUD (delete by GET) | `/news…` | `housekeeping.news` | P4 |
| banners | banner CRUD (add was broken) | `/banners…` | `housekeeping.banners` | P4 |
| vouchers | create credit or item vouchers | `GET/POST /vouchers` (credits only) | `housekeeping.vouchers` | P6 |
| server, recycler, wordfilter, welcomemsg, chatlogs, onlinelist | emulator settings and data | deferred | — | — |
| dbquery, dbrepair, dboptimize, holocms, credits, help_main, help_bugs, help_svn | raw SQL, REPAIR/OPTIMIZE by GET, static pages | dropped ([0021](/decisions/0021-dropped-and-kept-features.md)) | — | — |

# Staff log

Holo logged: login, server/site settings changes, home store additions, vouchers, credits, badges, rank changes,
user edits, bans, mass unbans, alerts, mass alerts, help picks and deletes, and log pruning. It did not log logout,
failed logins, notes, content, banners, news, database tools or access denials. The new `staff_logs` row is written
for every mutation: actor user, target user and/or habbo, action, detail, IP and time.

# Layout and UI

- Six tabs (Dashboard, Server, Site & Content, HoloCMS, Users & Moderation, Help), a left menu per tab, and a
  content column; the new layout keeps the tab strip, left menu and content structure.
- Reusable pieces: form panel (title bar, label column, input column, sub-header rows), data table, message line,
  dashboard panes.
- Colours: [housekeeping colours](/reference/colours.md#housekeeping).
- Not ported: the song lyrics in `header.php`, the offensive fallback rank label, the IPB leftover JavaScript and
  CSS.

# Risky Holo behaviour not to copy

- `dbquery.php` ran arbitrary SQL as the database root user.
- `add_homes_stuff.php` fetched any URL server-side (`getimagesize`) and appended unescaped text to a CSS file.
- `edituser.php` built `UPDATE users SET <POST key>` from arbitrary POST keys, password included.
- Pervasive SQL injection and stored XSS through usernames, chat logs, help queries and banners.
- Ban expiry date math was wrong (month 0 in December, swapped day and month when parsing).
- Moderators (rank 6) could mint credits and vouchers.
