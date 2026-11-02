---
type: Phase
title: HK-B Users and moderation
description: Housekeeping search and editing of users and habbos, credits, badges, bans, alerts and the help queue.
status: active
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [hk-b, housekeeping]
---

# Goal

Staff can find any habbo or user, edit allowed fields, give credits and badges, ban and lift bans, alert habbos and
handle help tickets.

# Scope

| Holo `?p=` | Route under `/housekeeping` | Attribute / notes |
| --- | --- | --- |
| users, ip, uid, clonechecker | `GET /habbos?q=` (name, email or IP), `GET /habbos/{id}` | `housekeeping.users`; the habbo, its owner, the owner's other habbos and IP history from `login_attempts` |
| edituser, badgetool | `POST /habbos/{id}`, `POST /users/{id}`, `POST /habbos/{id}/badges`, `POST /habbos/{id}/badges/{code}/delete` | `housekeeping.usersEdit`; only listed fields are editable (Holo took column names from the POST) |
| givecredits, transactions | `POST /habbos/{id}/credits`, `GET /habbos/{id}/transactions` | `housekeeping.credits`; wallet and ledger in one transaction |
| ban, unban, banlist | `GET /bans`, `POST /bans`, `POST /bans/{id}/lift` | `housekeeping.bans`; real `expires_at`; a ban also calls `LogoutEverywhere` |
| alert, massalert, alertlist | `GET /alerts`, `POST /alerts` | `housekeeping.alerts`; sending to everyone also needs `housekeeping.alertsBroadcast` |
| helper | `GET /help`, `POST /help/{id}/pick`, `POST /help/{id}/close` | `housekeeping.help` |

Holo details: [housekeeping reference](/reference/holo-housekeeping.md).

- Every action on a user works only on users below the actor ([0055](/decisions/0055-staff-levels.md)).
- The user page gives direct attributes, with `housekeeping.accessGroups`, and emails and IP history take
  `housekeeping.usersPrivate` ([0053](/decisions/0053-attributes-on-groups-and-users.md)).
- Credits act on the user's wallet ([0056](/decisions/0056-wallet-club-and-inventory-per-user.md)).
- Staff restore archived habbos here ([0058](/decisions/0058-habbos-are-archived.md)).
- The ban page takes its look from Sulake's `Mass banning and kicking` ([0060](/decisions/0060-housekeeping-components.md)).

# Exit criteria

- Every action writes a staff log row with the actor user and the target.
- A banned user's sessions end and their next login shows the reason and expiry.

# Tasks

- [hk-b-01 Find habbos and read them](/tasks/hk-b-01-find-habbos.md) — done
- [hk-b-02 Edit habbos and users](/tasks/hk-b-02-edit-users.md) — done
- [hk-b-03 Give and remove badges](/tasks/hk-b-03-badges.md) — done
- [hk-b-04 Give credits and read transactions](/tasks/hk-b-04-credits.md) — done
- [hk-b-05 Ban users and lift bans](/tasks/hk-b-05-bans.md) — todo
- [hk-b-06 Send alerts](/tasks/hk-b-06-alerts.md) — todo
- [hk-b-07 Handle help tickets](/tasks/hk-b-07-help.md) — todo
- [hk-b-08 Give direct attributes](/tasks/hk-b-08-direct-attributes.md) — todo
- [hk-b-09 Restore archived habbos](/tasks/hk-b-09-restore-habbos.md) — todo
- [hk-b-10 Verify HK-B](/tasks/hk-b-10-exit-check.md) — todo
