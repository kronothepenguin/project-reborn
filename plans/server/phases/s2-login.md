---
type: Phase
title: S2 Login and session
description: A habbo logs in with an SSO ticket and reaches the hotel view with their name, look, credits, badges and settings, and the session stays alive.
status: planned
timestamp: 2026-11-05T20:57:45+00:00
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
| `hh_human` | [s1-22](/tasks/s1-22-human.md) | The figure system's command |

- The first rules in `game`, and the first entity in `virtual`: the habbo, loaded at login and dropped at logout
  ([0009](/decisions/0009-virtual-holds-the-server-state.md)).
- The last time online is saved ([0011](/decisions/0011-saved-and-memory-only-data.md)).
- Tables that exist already: `sso_tickets`, `avatars`, `avatar_badges`, `wallets`, `club_subscriptions` and the access
  tables.

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- How a rule in `game` tells other habbos' sessions about an event without knowing their protocol.
- Who builds the site's `/client` page that hands out SSO tickets (`plans/holo-port/decisions/0013-defer-game-server-features.md`
  deferred it until the server exists), and how a test client gets a ticket.
- Whether the client's own login box (`TRY_LOGIN`, name and password) works, or only SSO, as in the old server.
- Which fuse rights a habbo gets (`plans/holo-port/decisions/0015-attribute-names-and-fuses.md`).
- Whether the hotel can close at set hours (opening hours).
- Which client versions the version check accepts.
- What happens to the machine id the client sends (`UNIQUEID`).
- What happens when a habbo who is online logs in a second time.
- Whether the latency reports are kept.
- When the last time online is written: at login, at logout, or both.
