---
type: Decision
title: The sign-in's SSO ticket is best-effort, and update 0008 waits for an administrator
description: Signing in to the CMS makes its SSO ticket after the session and only logs a failure, which happens only while the update that gives sso_tickets its new form waits; that update is not automatic, and the client page makes a ticket whenever none is valid.
status: accepted
timestamp: 2026-11-09T23:20:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T23:20:00+00:00"}
tags: [server, cms, auth, data]
---

# Decision

- Signing in to the CMS makes its SSO ticket ([0030](/decisions/0030-sso-tickets-from-the-cms-sign-in.md)) after the
  session, outside its transaction, and only logs a failure.
- A failure happens only while the update `0008-sso-tickets-as-text.sql`, which gives `sso_tickets` its new form,
  waits. The update is not automatic: it waits for an administrator, as the other updates do, and the hotel is closed
  meanwhile.
- The client page makes a ticket whenever the session holds no valid one.

# Context

A sign-in that needs an update makes that update automatic, and an automatic update applies every waiting update before
it at start. With `0008` automatic, nothing would ever wait, and the tests of the update page and of the maintenance
gate, which need an update that waits, would fail. Offered a best-effort ticket at sign-in, or an automatic update with a
hook that lets those tests use a list of updates of their own, the user chose "Best-effort at sign-in (Recommended)":
"Sign-in makes the ticket right after the session and only logs a failure, which happens only while 0008 waits (the
hotel is closed then anyway). The client page makes a ticket whenever none is valid. 0008 waits for an administrator
like the other updates, and the update tests keep working."

# Consequences

- [s2-02](/tasks/s2-02-sso-tickets-at-sign-in.md) follows it in `packages/auth` and in the update.
