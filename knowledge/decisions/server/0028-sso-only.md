---
type: Decision
title: Habbos log in with SSO tickets only
description: The client's own login box is refused: TRY_LOGIN gets 33 login incorrect, and a habbo logs in only with SSO and a ticket from the CMS, so passwords never travel over the game connection.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, protocol, security]
---

# Decision

- `TRY_LOGIN` (756) is answered with 33 `login incorrect`, whatever name and password it carries.
- A habbo logs in only with `SSO` (204) and a ticket from the CMS ([0030](/decisions/server/0030-sso-tickets-from-the-cms-sign-in.md)).
  Passwords never travel over the game connection.

# Context

The client logs in with `SSO` when its page gives it a ticket, and with `TRY_LOGIN`, a name and a password,
otherwise. Offered SSO only or the login box too, the user chose "SSO only (Recommended)": "As the old server:
TRY_LOGIN is answered with 'login incorrect', and a habbo logs in only with the ticket the site's /client page gives.
Passwords never travel over the game connection."

# Consequences

- s2-06 follows it.
