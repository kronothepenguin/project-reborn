---
type: Reference
title: The handshake and the login
description: The hh_entry_init commands that take a client from HELLO to LOGIN_OK and what the server answers to each.
tags: [server]
---

`r26`'s handlers of hh_entry_init take a client from `HELLO` to `LOGIN_OK`
([hh_entry_init](/r26/hh_entry_init.md)):

| Command | Answer |
| --- | --- |
| `INIT_CRYPTO` (206) | `CRYPTOPARAMETERS` (277) with 0, then `ENDOFCRYPTOPARAMS` (278) at once: nothing is enciphered. `GENERATEKEY`, which the client sends after 277, has no handler and is logged as unhandled (`knowledge/decisions/server/0027-endofcryptoparams-right-after-cryptoparameters.md`) |
| `VERSIONCHECK` (1170) | Nothing when the version is `game.clientVersion` and both URLs are empty or on `site.url`: the URL itself or the URL followed by `/`. Any other client, or a body that cannot be read, gets 33 `Version not correct`, and the server closes the connection (`knowledge/decisions/server/0049-a-wrong-version-is-closed.md`) |
| `UNIQUEID` (813) | Nothing: the session keeps the machine id for the login |
| `GET_SESSION_PARAMETERS` (1817) | 257 with the ten session parameters, ids 0 to 9, from their `game.` settings; a flag goes out as 0 or 1 |
| `SSO` (204) | The habbo's fuses (2), then `LOGIN_OK` (3), as Holo sent them, once `game.Login` logs the ticket's habbo in; 33 `login incorrect` for a ticket that is not valid. Before a `VERSIONCHECK` that passed, 33 `Version not correct` and the close. A session logs in once, and later `SSO`s get no answer. A failure of the database is logged and closes the session |
| `TRY_LOGIN` (756) | 33 `login incorrect`, always: a habbo logs in only with `SSO` (`knowledge/decisions/server/0028-sso-only.md`) |
