---
type: Plan
title: "Moderation: how"
description: The game runs chat commands, the word filter and calls for help; housekeeping holds the staff pages.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/housekeeping` | `/bans`, `/alerts`, `/help` (Help Queries) and `/chatlogs`, each behind its attribute, with a staff log row for every change (`packages/housekeeping/knowledge/index.md`) |
| `packages/cms` | `GET` and `POST /help`, the report of a forum post, the Help Tool window `layouts/help-tool`, and the ban message at sign-in |
| `packages/auth` | `ActiveBan`, which passes holders of `housekeeping.access` on a banned address, and `LogoutEverywhere`, which ends a banned user's sessions |
| `packages/store` | The bans, the alerts, the help tickets with their post reports, and the saved chat |
| `packages/server` | Saves what habbos say in rooms, and deletes the lines older than `game.chatHistoryDays` every hour |

Planned:

| Project | Part |
| --- | --- |
| `packages/server` | Holo's chat commands and their fuses ([later](/features/moderation/later.md), "Holo's chat commands"); the word filter; the call for help and Hobba of `hh_shared` (`packages/server/knowledge/r26/hh_shared.md`); a ban or an alert from housekeeping reaching the player at once |
| `packages/housekeeping` | The word filter's page and the welcome message's, which the port deferred; staff tools for groups ([later](/features/moderation/later.md)); Holo's "An ingame notification has been sent" restored |
| `packages/store` | What calls for help and the filter save |

# Decisions

- [What housekeeping can delete](/decisions/holo-port/0063-what-housekeeping-can-delete.md) — Bans are lifted and help
  requests are closed, and both stay as history.
- [One waiting request per habbo, and reports in the Help Tool's window](/decisions/holo-port/0090-post-reports.md) — A
  habbo has one help request or post report waiting at a time, and a report goes through Holo's Help Tool window.
- [The help form asks visitors to sign in first](/decisions/holo-port/0108-help-asks-visitors-to-sign-in.md) — `/help`
  takes a signed-in habbo, so every request has a habbo.
- [A help request's subject takes 50 characters, and its question
  help.messageMaxLength](/decisions/holo-port/0109-help-request-lengths.md) — The server checks the subject's 50
  characters and the question against `help.messageMaxLength`, 65535 by default.
- [Staff read the chat history in housekeeping, and it is kept 30
  days](/decisions/server/0066-staff-read-the-chat-history-30-days.md) — A page behind its own attribute searches the
  saved chat by room or habbo, and lines older than 30 days, a setting, go.
- [The game server prunes the chat history hourly](/decisions/server/0084-the-game-server-prunes-the-chat-hourly.md) —
  The game server deletes the old lines when it starts and every hour.
- [The Chat Log Viewer lists 100 lines a page](/decisions/server/0085-the-chat-log-viewer-pages-by-100.md) — Newest
  first, 100 lines a page, with the Newer and Older links of the Staff Logs.
- [The Chat Log Viewer marks public rooms](/decisions/server/0086-the-chat-log-marks-public-rooms.md) — The Room ID
  column shows `Public 101` for a public room, and `-` for a deleted room.

# Notes

- The help form keeps the text as typed, and Help Queries escapes it when it shows it.
