---
type: Decision
title: packages/virtual holds the server's hot data and temporary data
description: The server's state lives in packages/virtual as hot data, saved data copied from the database while it is in use, and temporary data that lives only in memory and is gone after a restart.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, virtual, data]
---

# Decision

- `packages/virtual` is the server's in-memory state.
- Hot data is saved data copied from the database while it is in use, so that the server does not read the database
  every time. It is loaded when needed and dropped when unused:
  - a habbo's data loads at login and is dropped at logout;
  - a room's furni, rights and bans load with the room and are dropped when it unloads;
  - data every player shares, such as the catalogue, the navigator categories, the furni definitions and the room
    models, loads when the server starts and stays.
- Temporary data lives only in memory and is gone after a restart, such as the positions of habbos and the rooms that
  are loaded with their habbos. A restart unloads every room and every habbo; what is saved stays in the database.
- Like `virtual/settings`, nothing in `virtual` keeps a database connection: functions that use the database receive
  the `*sql.DB`.

# Context

The user: "use the @packages/virtual/ as the in-memory state for the server", "use the in-memory state to load as a
cache data from the database, we call this hot data so we don't look at database all the time" and "use the in-memory
state for temporal data like user position and active rooms with users, every room is unload on a server reset and
every user too but something like furnis in the room is persistent in the database".

Offered loading when needed or loading everything at start, the user chose loading when needed and dropping when
unused.

# Consequences

- What is saved and what is temporary: [0011](/decisions/server/0011-saved-and-memory-only-data.md).
- When a change to hot data reaches the database: [0010](/decisions/server/0010-hot-data-written-at-once.md).
