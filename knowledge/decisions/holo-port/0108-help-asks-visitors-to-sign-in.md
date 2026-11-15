---
type: Decision
title: The help form asks visitors to sign in first
description: GET and POST /help take a signed-in habbo, and a visitor who is not signed in is sent to sign in, as the post-report window does, so that every help request has a habbo and the one waiting request per habbo holds.
status: accepted
timestamp: 2026-11-09T18:02:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:02:12+00:00"}
tags: [help, access, holo]
---

# Decision

- `GET /help` and `POST /help` take a signed-in habbo. A visitor who is not signed in is sent to sign in, as the
  post-report window of P5 does.
- Every help request then belongs to the active habbo, and the one waiting request per habbo of
  [0090](/decisions/holo-port/0090-post-reports.md) holds for help requests and post reports alike.

# Context

Holo's `iot/go.php` took a ticket from anyone who opened it, signed in or not, a guest's ticket carrying an empty
name, though its header linked to the help tool only for signed-in users. Offered asking visitors to sign in, or
letting guests send with the waiting request counted per address as Holo did, the user chose "Sign in first
(Recommended)": "Like the post-report window today: a visitor is sent to the sign-in page. Every request then comes
from a habbo, so the one-waiting-request rule applies and staff know whom to answer."

# Consequences

- P7's help page sits behind the session check, and
  [Holo's differences](/sources/holocms/differences.md) lists it.
