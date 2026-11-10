---
type: Task
title: Answer what the client asks after its login
description: After LOGIN_OK the client gets the habbo's user object, fuses, credits, badges, achievements, sound setting and club status, and the server date.
status: todo
phase: s2
depends_on: [s2-03, s2-04, s2-06]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_club/4_Club Handler Class.ls", "packages/client-r26/src/game/hh_shared/7_Server Date Class.ls"]
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

After `LOGIN_OK` the client gets what it asks for ([hh_entry_init](/reference/r26/hh_entry_init.md), After the login): the habbo's name and look, fuses,
credits, badges, achievements and sound setting, the club status ([hh_club](/reference/r26/hh_club.md)) and the server
date ([hh_shared](/reference/r26/hh_shared.md)).

# Steps

- [ ] `GET_INFO` gets 5, the user object.
- [ ] The habbo's fuses go out as 2 ([0045](/decisions/0045-fuses-holos-club-set-and-every-checked-fuse.md)).
- [ ] `GET_CREDITS` gets 6 with the habbo's credits, as `hh_cat_code` reads it ([hh_cat_code](/reference/r26/hh_cat_code.md)).
- [ ] `GETAVAILABLEBADGES` gets 229, and `GETSELECTEDBADGES` the habbo's chosen badges.
- [ ] `GET_POSSIBLE_ACHIEVEMENTS` gets 436.
- [ ] `GET_SOUND_SETTING` gets 308 with the saved setting, and `SET_SOUND_SETTING` saves it
  ([0038](/decisions/0038-the-sound-setting-is-saved.md)).
- [ ] `hh_club`'s `SCR_GET_USER_INFO` gets the club status, from `club_subscriptions`.
- [ ] `hh_shared`'s server date.
- [ ] Tests with the Go test client, for each answer.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-after-login`.
- What a habbo's achievements are is asked when the task starts, if any.
