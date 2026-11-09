---
type: Task
title: Speak the handshake and the login
description: r26 takes a client from HELLO to LOGIN_OK with an SSO ticket: the handshake without encryption, the version check, the machine id, the session parameters, SSO and TRY_LOGIN, and the old session's 287 on a second login.
status: todo
phase: s2
depends_on: [s2-01, s2-05]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_entry_init/7_Login Component Class.ls"]
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

A client goes from `HELLO` to `LOGIN_OK` (3) with an SSO ticket, as [hh_entry_init](/reference/r26/hh_entry_init.md) maps it.

# Steps

- [x] Ask the user, before the version check: the client sends both URLs of `VERSIONCHECK` empty outside a browser
  plugin, and the client URL empty when its host is local, such as `localhost` or `192.168.` ([hh_entry_init](/reference/r26/hh_entry_init.md)). What the check
  does with empty URLs, and with the `runMode` LibreShockwave reports, becomes a decision:
  [0041](/decisions/0041-an-empty-versioncheck-url-passes.md).
- [ ] `INIT_CRYPTO` gets `CRYPTOPARAMETERS` 0 and `ENDOFCRYPTOPARAMS` at once; a later `GENERATEKEY` is logged
  ([0027](/decisions/0027-endofcryptoparams-right-after-cryptoparameters.md)).
- [ ] `VERSIONCHECK`: the version the setting holds, and URLs under `site.url`; any other client gets 33
  `Version not correct`, which the client shows as `alert_old_client` ([0033](/decisions/0033-one-client-version-from-the-site.md)).
- [ ] `UNIQUEID`: the session keeps the machine id until the login ([0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md)).
- [ ] `GET_SESSION_PARAMETERS` gets 257 with the ten settings ([0034](/decisions/0034-session-parameters-are-settings.md)).
- [ ] `SSO` logs in through `game` and gets 3, or 33 `login incorrect`; `TRY_LOGIN` always gets 33 `login incorrect`
  ([0028](/decisions/0028-sso-only.md)).
- [ ] The session implements `game`'s interface: the end of a session replaced by a second login is 287 with reason 2,
  then the close ([0029](/decisions/0029-a-second-login-closes-the-first.md)).
- [ ] Tests with the Go test client: the handshake in bytes, a wrong version, a ticket that logs in once, `TRY_LOGIN`,
  and a second login.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-handshake-and-login`.
