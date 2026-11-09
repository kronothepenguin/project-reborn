---
type: Phase
title: S2 Login and session
description: A habbo logs in with an SSO ticket and reaches the hotel view with their name, look, credits, badges and settings, and the session stays alive.
status: active
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s2, server]
---

# Goal

A habbo opens the client with an SSO ticket from the site, logs in, and reaches the hotel view with their name, look,
credits, badges, rights and sound setting. The session stays alive with pings until the habbo leaves.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_entry_init` | [s1-02](/tasks/s1-02-entry-init.md) | Handshake without encryption ([0012](/decisions/0012-no-encryption.md)), version check, SSO login, user object, rights, credits, badges, achievements, session parameters, sound setting, ping, latency test, hotel logout, opening hours |
| `hh_shared` | [s1-03](/tasks/s1-03-shared.md) | Server date, error reports, statistics |
| `hh_club` | [s1-10](/tasks/s1-10-club.md) | The club status the client asks for at login |
| `hh_human` | [s1-22](/tasks/s1-22-human.md) | The figure strings the client reads; the figure system's one command, `GETAVAILABLESETS`, is never sent |

- The first rules in `game`, and the first entity in `virtual`: the habbo, loaded at login and dropped at logout
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)).
- The last time online is saved ([0011](/decisions/0011-saved-and-memory-only-data.md)).
- Tables that exist already: `sso_tickets`, `avatars`, `avatar_badges`, `wallets`, `club_subscriptions` and the access
  tables.

# Exit criteria

- A Go test client logs in end to end with a ticket it inserts: `HELLO`, the handshake without encryption, the version
  check, the session parameters, `SSO` and `LOGIN_OK`, then the user object, the fuses, the credits, the badges, the
  sound setting and the club status; it answers pings, and a second login ends the first session with 287.
- Signing in to the CMS creates a ticket that the server accepts once, and that dies with the CMS session.
- S2's settings are in housekeeping, and its fuses come from the defaults, the club and the access groups.
- The last time online, the machine id and the sound setting are saved.
- Every gate passes.

# Tasks

1. [s2-01 Add S2's settings](/tasks/s2-01-settings.md)
2. [s2-02 Create SSO tickets at the CMS sign-in](/tasks/s2-02-sso-tickets-at-sign-in.md)
3. [s2-03 Save the last time online, the machine id and the sound setting](/tasks/s2-03-saved-login-data.md)
4. [s2-04 Add the fuse catalogue](/tasks/s2-04-fuse-catalogue.md)
5. [s2-05 Log a habbo in and out in game](/tasks/s2-05-login-in-game.md)
6. [s2-06 Speak the handshake and the login](/tasks/s2-06-handshake-and-login.md)
7. [s2-07 Answer what the client asks after its login](/tasks/s2-07-after-login.md)
8. [s2-08 Keep the session alive and end it](/tasks/s2-08-keeping-the-session-alive.md)
9. [s2-09 Check S2's exit criteria](/tasks/s2-09-exit-check.md)
