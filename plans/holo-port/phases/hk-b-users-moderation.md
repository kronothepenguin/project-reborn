---
type: Phase
title: HK-B Users and moderation
description: Housekeeping search and editing of users and habbos, credits, badges, bans, alerts and the help queue.
status: planned
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

# Exit criteria

- Every action writes a staff log row with the actor user and the target.
- A banned user's sessions end and their next login shows the reason and expiry.

# Tasks

Created when the phase starts.
