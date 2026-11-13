---
type: Decision
title: An unhandled packet is logged by its id, its name and its size
description: A packet the server does not handle yet is logged as one line with the session's address, the command's id, its name when r26 knows it, and the body's size; the body itself is never logged.
status: accepted
timestamp: 2026-11-07T00:12:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:12:36+00:00"}
tags: [server, protocol, logging]
---

# Decision

- A packet the server does not handle yet is logged as one line: the session's address, the command's id, its name
  when `r26` knows it, and the size of its body. For example: `r26 127.0.0.1:53422 unhandled TRY_LOGIN (756), 18 bytes`.
- The body itself is never logged.

# Context

Asked what goes in that line, and told that until [S2](/phases/s2-login.md) handles login, the body of `TRY_LOGIN`
(756) carries the typed password and the body of `SSO` (204) the ticket
([hh_entry_init](/reference/r26/hh_entry_init.md#commands-from-the-client)), the user chose "Id, name and size
(Recommended)": "e.g. `r26 127.0.0.1:53422 unhandled TRY_LOGIN (756), 18 bytes`. Shows what the client asks for, and
keeps passwords and tickets out of the log."

# Consequences

- [s0-07](/tasks/s0-07-r26-sessions.md) logs every packet that no handler takes in that line, and the session goes on.
- A packet leaves that log once a later phase registers a handler for its id.
