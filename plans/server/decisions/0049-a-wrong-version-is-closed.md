---
type: Decision
title: A client with the wrong version is closed after its error
description: A VERSIONCHECK that fails gets 33 Version not correct, and the server then closes the connection; an SSO before a VERSIONCHECK that passed is turned away the same way.
status: accepted
timestamp: 2026-11-10T02:18:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:18:18+00:00"}
tags: [server, protocol, login]
---

# Decision

- A `VERSIONCHECK` that fails [0033](/decisions/0033-one-client-version-from-the-site.md) gets 33 `Version not correct`,
  and the server then closes the connection. A body the server cannot read fails it too.
- An `SSO` that comes before a `VERSIONCHECK` that passed is turned away the same way, so that no client logs in
  without the check.
- A URL starts with `site.url` when it is `site.url` itself or `site.url` followed by `/`: `site.url` is an origin, so
  `http://localhost:17387.example.com/` does not pass for `http://localhost:17387`.

# Context

On 33 `Version not correct` the client only shows `alert_old_client` and goes on: it sent `GET_SESSION_PARAMETERS`
with `VERSIONCHECK`, and sends `SSO` once 257 comes ([hh_entry_init](/reference/r26/hh_entry_init.md#error-texts)).
Offered answering nothing more, closing after the error, or refusing at `SSO`, the user chose "Close after the error":
"Send 33 and close the connection. Before LOGIN_OK the client treats a lost connection as fatal (fatalError with the
state start_session), which may cover the alert."

# Consequences

- [s2-06](/tasks/s2-06-handshake-and-login.md) applies it.
