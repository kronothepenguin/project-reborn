---
type: Decision
title: P1 signs in to a minimal /me page
description: During P1, sign-in and registration redirect to a small GET /me showing the habbo and a sign-out button, and GET / redirects signed-in visitors there, so P2 only fills in the page.
status: accepted
timestamp: 2026-10-30T21:10:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T21:10:07+00:00"}
tags: [cms, p1]
---

# Decision

- `GET /me` exists from P1. It needs a session and shows the active habbo and a Sign out button.
- Sign-in and registration redirect to `/me`, and `GET /` redirects signed-in visitors there, as Holo does.
- P2 replaces the content of the page.

# Context

Holo sends signed-in visitors to `me.php`, which P2 ports, but P1's exit criteria already sign out after signing in.
The user preferred this to a temporary signed-in box on the landing page: the redirects are final from P1, and no
temporary code goes on the landing page.

# Consequences

- The page uses the `signed-out` layout until P2 builds the community layout.
