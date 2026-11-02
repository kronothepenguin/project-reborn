---
type: Decision
title: Account forms keep the birth date and the session
description: The email and password forms keep Holo's birth date question, and a password change keeps the session of the user who made it, with a new token.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [account, auth]
---

# Decision

- `/account/email` and `/account/password` keep asking for the current password and the birth date, as Holo does.
- A password change keeps the session of the user who made it, with a new token, and ends every other session and open
  reset link.

# Context

The plan had dropped the birth date, and [0034](/decisions/0034-behaviour-matches-holo.md) brought it back. Asked which
stands, the user answered "keep". Holo's password form says "You will need to login again.". The user asked: "can we
just keep session for the one changes the password or is it a security issue?", was told it is the usual way, and did
not object.

# Consequences

- The form no longer says "You will need to login again.", and [the differences](/reference/holo-differences.md) list
  it.
