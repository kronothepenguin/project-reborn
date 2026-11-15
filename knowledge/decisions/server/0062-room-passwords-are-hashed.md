---
type: Decision
title: Room passwords are stored hashed
description: A room's password is stored as a hash, like the users' passwords, and entering a room compares the typed password with it; nobody can read it back.
status: accepted
timestamp: 2026-11-10T03:39:13+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:39:13+00:00"}
tags: [server, rooms, security]
---

# Decision

- A room's password is stored as a hash, as the users' passwords are, and entering a room
  (S4) compares the typed password with it.
- Nobody, staff included, can read a room's password back.

# Context

The client sends the password in clear when the owner sets it and when someone enters, and never asks for it back:
`GETFLATINFO`'s answer carries none (hh_navigator (`packages/server/knowledge/r26/hh_navigator.md#a-flats-settings`)). Offered a hash,
or the password as typed, as Holo kept it, the user chose "Hashed (Recommended)": "Stored as a hash, like the users'
passwords; entering a room (S4) compares the typed password with it. Nobody, staff included, can read a room's password
back."

# Consequences

- s3-06 and s3-07 store it hashed.
