---
type: Task
title: Check S2's exit criteria
description: From the merged work, check every exit criterion of S2 and close the phase.
status: done
phase: s2
depends_on: [s2-01, s2-02, s2-03, s2-04, s2-05, s2-06, s2-07, s2-08]
packages: [packages/server, packages/auth, packages/store]
client: []
timestamp: 2026-11-10T03:19:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T03:19:16+00:00"}
---

# Goal

S2 meets its [exit criteria](/phases/s2-login.md#exit-criteria) on `main`.

# Steps

- [x] Every exit criterion of [S2](/phases/s2-login.md), checked one by one on the merged work.
- [x] `packages/server/README.md` and the reference describe what S2 added.
- [x] S2 is `done`; `/index.md` names the active phases.

# Verification

```sh
make install && make gates
cd packages/server && go test ./... -race -v
```

Results, on the merged work of s2-01 to s2-08 (`main` at `92d56209`):

- "A Go test client logs in end to end with a ticket it inserts…": `TestAClientLogsInEndToEnd`, added here, walks one
  session from `HELLO` through the handshake without encryption, `VERSIONCHECK` with `UNIQUEID` and
  `GET_SESSION_PARAMETERS`, 257, `SSO`, the fuses (2) and `LOGIN_OK`, then gets 5, 6, 229, 308 and 7, answers two
  `PING`s, and is ended by a second login with 287, reason 2, and the close. `TestTheHandshakeAndTheLoginInBytes`,
  `TestASecondLoginEndsTheFirstSession` and `TestTheServerPingsAndKeepsAClientThatAnswers` check the bytes and the
  timing. Passes.
- "Signing in to the CMS creates a ticket that the server accepts once, and that dies with the CMS session":
  `TestACMSSignInMakesATicketTheServerAcceptsOnce`, added here, signs in with `auth.Login`, takes the ticket with
  `auth.SSOTicket`, logs in to the server once, gets 33 `login incorrect` for the spent ticket, and again for a new
  ticket once `auth.Logout` ended the CMS session. With `TestATicketLogsInOnce` and auth's
  `TestSignInMakesAnSSOTicketThatIsSpentOnce` and `TestATicketDiesWithItsSession`. Passes.
- "S2's settings are in housekeeping, and its fuses come from the defaults, the club and the access groups":
  housekeeping's `TestTheGameFormHoldsTheClientsSettings` and `TestSavingAGroupsFuses`, auth's
  `TestEveryHabboHoldsTheDefaultFuses`, `TestClubMembersHoldTheClubFusesWhileTheClubRuns` and
  `TestAccessGroupsGrantFuses`, and the server's `TestTheFusesComeBeforeLoginOK`. Passes.
- "The last time online, the machine id and the sound setting are saved": store's `TestAHabbosGameLoginDataIsSaved`,
  game's `TestLoginSavesTheMachineIDAndTheLastTimeOnline`, `TestLogoutWritesTheLastTimeOnline` and
  `TestSetSoundEnabledSavesTheSettingThenTheCopy`, and the server's `TestTheSoundSettingIsSaved` and
  `TestASilentClientIsClosedAndItsHabboLoggedOut`. Passes.
- "Every gate passes": `make install` exits 0 and changes no tracked file; `make gates` exits 0, with 28 packages
  `ok`; `go test ./... -race -v` in `packages/server` passes its 78 tests.
- `packages/server/README.md` describes S2's work: the handshake and the login, what the client asks after it, keeping
  the session alive, `game`, and now the tests; [the architecture](/reference/architecture.md) the packages and how a
  rule reaches its sessions.
- [S2](/phases/s2-login.md) is done. [S3](/phases/s3-navigator.md) is next, once its open questions are answered.

# Notes

- Runs on the branch `s2-exit-check`.
