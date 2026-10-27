---
type: Decision
title: Game-server features are deferred
description: Everything in Holo that needs the game emulator waits until the game server exists; meanwhile the hotel shows as offline.
status: accepted
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
tags: [scope, game-server]
---

# Decision

Deferred until the game server exists:

- online count and hotel status;
- recommended rooms and room lists;
- the friends and rooms quick menus;
- `/client` and the use of SSO tickets;
- item vouchers;
- chat logs and the online list;
- the server, recycler, wordfilter, welcome-message and loader settings;
- the welcome room picker;
- MUS pushes;
- R26 fuses ([0015](/decisions/0015-attribute-names-and-fuses.md)).

# Context

Holo read `rooms`, `messenger_friendships`, `furniture`, `catalogue_items`, `system`, `system_chatlog` and
`system_config` from the emulator's database and pushed MUS commands (see
[protocols](/reference/holo-protocols.md)). No game server exists in the repository yet.

# Consequences

- The `sso_tickets` table exists, but its API is built together with the client page.
- Credits, badges and looks change only in the database; the future server reads them at login.
