---
type: Task
title: Create SSO tickets at the CMS sign-in
description: Signing in to the CMS creates an SSO ticket for the active habbo, kept as text with the session that created it, which the client page reads and the game server spends.
status: done
phase: s2
depends_on: []
packages: [packages/store, packages/auth]
client: []
timestamp: 2026-11-09T23:22:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T23:22:28+00:00"}
---

# Goal

Signing in to the CMS creates an SSO ticket for the active habbo, and the CMS can always give the client page a
valid one ([0030](/decisions/0030-sso-tickets-from-the-cms-sign-in.md)).

# Steps

- [x] Change `sso_tickets` with the `adding-data-persistence` skill: the ticket as text in place of its digest, and the
  CMS session that created it, so that the ticket dies with the session. Update its OKF documents and the Session
  entity, which loses the invariant that SSO ticket ids are digests.
- [x] Queries: create a ticket, get a session's valid ticket, find a valid ticket by its text, and spend it.
- [x] `packages/auth`: signing in creates a ticket for the active habbo; switching habbo replaces it; and a function
  that the client page of `plans/client`'s C1 calls returns the session's valid ticket, creating one when none is left.
- [x] Tests: a sign-in creates a ticket; a spent ticket is replaced; a logout takes the session's tickets with it;
  switching habbo replaces the ticket.

# Verification

```sh
cd packages/store && go test ./... -race
cd packages/auth && go test ./... -race
make gates
```

Results:

- `sso_tickets` keeps the ticket as text, with the CMS session that made it (`session_id`, `ON DELETE CASCADE`), and
  loses `expires_at`: a ticket counts while its session has not expired and still has the ticket's habbo active
  ([0030](/decisions/0030-sso-tickets-from-the-cms-sign-in.md)). The update `0008-sso-tickets-as-text.sql` makes the
  table again, and is not automatic ([0043](/decisions/0043-the-sign-in-ticket-is-best-effort.md)).
- `CreateSSOTicket`, `GetSessionSSOTicket`, `DeleteSessionSSOTickets` and `SpendSSOTicket`, which deletes a valid
  ticket and returns its habbo.
- `packages/auth`: `Login` makes a ticket right after the session, and only logs a failure
  ([0043](/decisions/0043-the-sign-in-ticket-is-best-effort.md)); `SwitchHabbo` drops the session's tickets with the
  habbo it leaves; and `SSOTicket(r, db)`, for the client page of `plans/client`'s C1, returns the session's valid
  ticket, making one when it holds none.
- `go test ./...` passes in `packages/store`, with `TestAnSSOTicketIsSpentOnceWhileItsSessionHoldsItsHabbo`, and with
  `-race` in `packages/auth`, with `TestSignInMakesAnSSOTicketThatIsSpentOnce`,
  `TestSwitchingHabboDropsTheSessionsTicket`, `TestATicketDiesWithItsSession` and `TestSSOTicketNeedsASession`.
- The CMS and housekeeping suites pass, the sign-in and update tests on every older database among them;
  `make check-docs` exits 0, and regenerating leaves the generated files unchanged.
- The OKF concepts of the table, the auth queries, the session entity, the schema and the update are updated or added.

# Notes

- Runs on the branch `s2-sso-tickets`.
- The client page itself is `plans/client`'s C1.
