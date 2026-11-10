---
type: Task
title: Answer what the client asks after its login
description: After LOGIN_OK the client gets the habbo's user object, fuses, credits, badges, achievements, sound setting and club status, and the server date.
status: done
phase: s2
depends_on: [s2-03, s2-04, s2-06]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_club/4_Club Handler Class.ls", "packages/client-r26/src/game/hh_shared/7_Server Date Class.ls"]
timestamp: 2026-11-10T02:38:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:38:04+00:00"}
---

# Goal

After `LOGIN_OK` the client gets what it asks for ([hh_entry_init](/reference/r26/hh_entry_init.md), After the login): the habbo's name and look, fuses,
credits, badges, achievements and sound setting, the club status ([hh_club](/reference/r26/hh_club.md)) and the server
date ([hh_shared](/reference/r26/hh_shared.md)).

# Steps

- [x] `game.Login` loads the habbo's badges, sound setting and fuses into `virtual/habbo`
  ([0053](/decisions/0053-the-online-habbo-holds-its-own-data.md)).
- [x] `GET_INFO` gets 5, the user object.
- [x] The habbo's fuses go out as 2 ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- [x] `GET_CREDITS` gets 6 with the habbo's credits, as `hh_cat_code` reads it ([hh_cat_code](/reference/r26/hh_cat_code.md)).
- [x] `GETAVAILABLEBADGES` gets 229. `GETSELECTEDBADGES` waits for achievements ([0051](/decisions/0051-no-achievements-yet.md)).
- [x] `GET_POSSIBLE_ACHIEVEMENTS` gets 436, with none ([0051](/decisions/0051-no-achievements-yet.md)).
- [x] `GET_SOUND_SETTING` gets 308 with the saved setting, and `SET_SOUND_SETTING` saves it
  ([0038](/decisions/0038-the-sound-setting-is-saved.md)).
- [x] `hh_club`'s `SCR_GET_USER_INFO` gets the club status, from `club_subscriptions`
  ([0052](/decisions/0052-club-status-by-days-per-month.md)).
- [x] `hh_shared`'s server date.
- [x] Tests with the Go test client, for each answer.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- `game.Login` loads the habbo's badges, the one it wears, its sound setting and its fuses into `virtual/habbo`, which
  gets `Update` for a change that the store already has ([0053](/decisions/0053-the-online-habbo-holds-its-own-data.md)).
- The fuses go out as 2 right before `LOGIN_OK`, as Holo sent them, so that the listeners of 3 find the rights in place
  ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- `GET_INFO` gets 5: the habbo's id, name, figure, gender and motto, the user's tickets, an empty pool figure, the
  user's film, and the newsletter as direct mail. `GET_CREDITS` gets 6 with the user's credits as text. Both read
  `game.UserAccount`.
- `GETAVAILABLEBADGES` gets 229 with the habbo's badges and the worn one in slot 1. `GET_POSSIBLE_ACHIEVEMENTS` gets
  436 with none, and `GETSELECTEDBADGES` has no handler ([0051](/decisions/0051-no-achievements-yet.md)).
- `GET_SOUND_SETTING` gets 308, and `SET_SOUND_SETTING` saves the setting through `game.SetSoundEnabled`
  ([0038](/decisions/0038-the-sound-setting-is-saved.md)).
- `SCR_GET_USER_INFO` gets 7 from `game.ClubStatus`, which splits the club's days by `club.daysPerMonth` and reads the
  periods with the store's new `ListClubSubscriptions` ([0052](/decisions/0052-club-status-by-days-per-month.md)).
- `GDATE` gets 163 with today's date in UTC.
- These commands get no answer before `LOGIN_OK`, and `join` stops the server when two casts handle one id.
- `go test ./... -race` passes in `packages/server`, with `TestTheUserObject`, `TestTheFusesComeBeforeLoginOK`,
  `TestTheCredits`, `TestTheBadges`, `TestThereAreNoAchievementsYet`, `TestTheSoundSettingIsSaved`,
  `TestTheClubStatus`, `TestTheServerDate`, `TestCommandsOfALoggedInHabboWaitForTheLogin`,
  `TestLoginLoadsTheHabbosOwnData`, `TestANewHabboLogsInWithTheSoundOn`, `TestSetSoundEnabledSavesTheSettingThenTheCopy`,
  `TestUserAccountReadsTheWalletAndTheNewsletter` and `TestTheClubSplitsItsDaysByTheMonth`, and in `packages/virtual`,
  with `TestUpdateChangesTheCopyWhileItsSessionPlaysIt`. In `packages/store`, `make check-docs` exits 0 with the new
  query documented.
- The READMEs of `packages/server` and `packages/virtual`, and [the architecture](/reference/architecture.md),
  describe the answers.

# Notes

- Runs on the branch `s2-after-login`.
- What a habbo's achievements are is asked when the task starts, if any.
