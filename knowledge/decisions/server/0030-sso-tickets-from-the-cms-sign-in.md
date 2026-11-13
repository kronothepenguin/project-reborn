---
type: Decision
title: SSO tickets come from the CMS sign-in and live as long as its session
description: Signing in to the CMS creates an SSO ticket for the active habbo, apart from the session's private token, kept as text so the CMS renders it into the client page and the game server compares it; it is spent once used and dies with the session.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, cms, auth, security]
---

# Decision

- Signing in to the CMS creates an SSO ticket for the active habbo, apart from the session's own token, which stays
  private.
- `sso_tickets` keeps the ticket as text, a "public ticket": the CMS reads it from the database to render it into the
  client page, and the game server compares the ticket the client sends with it, and logs in the habbo it names while
  it is valid.
- A ticket is spent once used. It lives as long as the CMS session that created it, and dies with it at logout. When the
  session has no valid ticket left, because it was spent or the habbo was switched, the CMS creates a new one when it
  needs one ("if needed").
- Go tests and test scripts insert their own tickets into `sso_tickets`, the way the browser suites seed staff
  accounts.

# Context

S2 asked how a test client gets a ticket before the client page exists, which `plans/client`'s C1 builds. The user
chose "Tests insert tickets (Recommended)": "Go tests and test scripts write a row into sso_tickets themselves, the way
the browser suites seed staff accounts. Trying the client by hand waits for C1's /client page. No new site code."

Asked where the session parameters come from, the user added: "ok with settings, but we already have a cms, same for
sso i forgot, the sso should be created when the user logs in the cms, please load cms knownledge and then extend login
to generate sso if needed. and make the urls to the site urls. you will need a setting for the site root or something
like that."

Asked how the sign-in hands a ticket to the client page, since `sso_tickets` stored only digests, the user answered:
"wtf, the server needs to render the sso in the client, and sso is just a text that can be compare againts the
database. if the login system saves any session to the database, that session text/ticket can be used as the sso only
if it is valid. the server needs to read the sso from the database... if for security reasons you don't want to expose
the session ticket, just create another public ticket at login time so the client sets it and the server can identify
the client by sso."

Asked how long a ticket stays valid, the user chose "As long as the session": "The ticket stays valid as long as the
CMS session it came from, and dies with it at logout."

# Consequences

- `sso_tickets` changes from a digest to the ticket's text, and names the session that created it; the store's
  Session entity loses the invariant that SSO ticket ids are digests
  (s2-02).
- `packages/auth`'s sign-in creates the ticket, and the client page of `plans/client`'s C1 reads it.
- s2-05 spends it at login.
