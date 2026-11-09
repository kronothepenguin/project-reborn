---
type: Task
title: Create SSO tickets at the CMS sign-in
description: Signing in to the CMS creates an SSO ticket for the active habbo, kept as text with the session that created it, which the client page reads and the game server spends.
status: todo
phase: s2
depends_on: []
packages: [packages/store, packages/auth]
client: []
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

Signing in to the CMS creates an SSO ticket for the active habbo, and the CMS can always give the client page a
valid one ([0030](/decisions/0030-sso-tickets-from-the-cms-sign-in.md)).

# Steps

- [ ] Change `sso_tickets` with the `adding-data-persistence` skill: the ticket as text in place of its digest, and the
  CMS session that created it, so that the ticket dies with the session. Update its OKF documents and the Session
  entity, which loses the invariant that SSO ticket ids are digests.
- [ ] Queries: create a ticket, get a session's valid ticket, find a valid ticket by its text, and spend it.
- [ ] `packages/auth`: signing in creates a ticket for the active habbo; switching habbo replaces it; and a function
  that the client page of `plans/client`'s C1 calls returns the session's valid ticket, creating one when none is left.
- [ ] Tests: a sign-in creates a ticket; a spent ticket is replaced; a logout takes the session's tickets with it;
  switching habbo replaces the ticket.

# Verification

```sh
cd packages/store && go test ./... -race
cd packages/auth && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-sso-tickets`.
- The client page itself is `plans/client`'s C1.
