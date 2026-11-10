---
type: Task
title: Speak the handshake and the login
description: r26 takes a client from HELLO to LOGIN_OK with an SSO ticket: the handshake without encryption, the version check, the machine id, the session parameters, SSO and TRY_LOGIN, and the old session's 287 on a second login.
status: done
phase: s2
depends_on: [s2-01, s2-05]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_entry_init/7_Login Component Class.ls"]
timestamp: 2026-11-10T02:24:20+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:24:20+00:00"}
---

# Goal

A client goes from `HELLO` to `LOGIN_OK` (3) with an SSO ticket, as [hh_entry_init](/reference/r26/hh_entry_init.md) maps it.

# Steps

- [x] Ask the user, before the version check: the client sends both URLs of `VERSIONCHECK` empty outside a browser
  plugin, and the client URL empty when its host is local, such as `localhost` or `192.168.` ([hh_entry_init](/reference/r26/hh_entry_init.md)). What the check
  does with empty URLs, and with the `runMode` LibreShockwave reports, becomes a decision:
  [0041](/decisions/0041-an-empty-versioncheck-url-passes.md).
- [x] `INIT_CRYPTO` gets `CRYPTOPARAMETERS` 0 and `ENDOFCRYPTOPARAMS` at once; a later `GENERATEKEY` is logged
  ([0027](/decisions/0027-endofcryptoparams-right-after-cryptoparameters.md)).
- [x] `VERSIONCHECK`: the version the setting holds, and URLs under `site.url`; any other client gets 33
  `Version not correct`, which the client shows as `alert_old_client` ([0033](/decisions/0033-one-client-version-from-the-site.md)),
  and the server closes the connection ([0049](/decisions/0049-a-wrong-version-is-closed.md)).
- [x] `server.New` loads the settings and reloads them like the CMS ([0050](/decisions/0050-the-server-loads-and-reloads-the-settings.md)).
- [x] `UNIQUEID`: the session keeps the machine id until the login ([0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md)).
- [x] `GET_SESSION_PARAMETERS` gets 257 with the ten settings ([0034](/decisions/0034-session-parameters-are-settings.md)).
- [x] `SSO` logs in through `game` and gets 3, or 33 `login incorrect`; `TRY_LOGIN` always gets 33 `login incorrect`
  ([0028](/decisions/0028-sso-only.md)).
- [x] The session implements `game`'s interface: the end of a session replaced by a second login is 287 with reason 2,
  then the close ([0029](/decisions/0029-a-second-login-closes-the-first.md)).
- [x] Tests with the Go test client: the handshake in bytes, a wrong version, a ticket that logs in once, `TRY_LOGIN`,
  and a second login.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `r26` takes a client from `HELLO` to `LOGIN_OK`. `INIT_CRYPTO` gets 277 with 0 and 278 at once, and `GENERATEKEY`
  stays unhandled and is logged ([0027](/decisions/0027-endofcryptoparams-right-after-cryptoparameters.md)).
  `VERSIONCHECK` passes the version `game.clientVersion` holds with URLs that are empty, `site.url`, or `site.url` and
  a `/`; any other client, or a body that cannot be read, gets 33 `Version not correct` and the close
  ([0033](/decisions/0033-one-client-version-from-the-site.md), [0041](/decisions/0041-an-empty-versioncheck-url-passes.md),
  [0049](/decisions/0049-a-wrong-version-is-closed.md)). `UNIQUEID` keeps the machine id for the login.
  `GET_SESSION_PARAMETERS` gets 257 with the ten settings ([0034](/decisions/0034-session-parameters-are-settings.md)).
  `SSO` logs in through `game.Login` and gets 3, or 33 `login incorrect`, and is turned away before a check that
  passed. `TRY_LOGIN` always gets 33 `login incorrect` ([0028](/decisions/0028-sso-only.md)).
- A session implements `game.Session`: on `ConcurrentLogin` it sends 287 with reason 2 and closes
  ([0029](/decisions/0029-a-second-login-closes-the-first.md)). A session that ends logs its habbo out with
  `game.Logout`.
- `server.New` loads the settings and reloads them every `cms.refresh` seconds while no update waits
  ([0050](/decisions/0050-the-server-loads-and-reloads-the-settings.md)), so the tests of `packages/server` open a
  database that they share.
- `go test ./... -race` passes in `packages/server`, with `TestTheHandshakeAndTheLoginInBytes`,
  `TestTheVersionCheckTakesTheSitesURLs`, `TestAWrongClientIsClosedAfterItsError`,
  `TestAnSSOBeforeTheVersionCheckIsTurnedAway`, `TestATicketLogsInOnce`, `TestTryLoginIsAlwaysIncorrect` and
  `TestASecondLoginEndsTheFirstSession`. S0's tests of unhandled commands use `GET_PASSWORD` and `LANGCHECK` now, and
  `TestInfoNeverLogsABody` also covers the handled `TRY_LOGIN` and `SSO`.
- The README of `packages/server` and [the architecture](/reference/architecture.md) describe the handshake and the
  login.

# Notes

- Runs on the branch `s2-handshake-and-login`.
