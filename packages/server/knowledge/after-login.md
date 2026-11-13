---
type: Reference
title: After the login
description: The commands the client asks right after LOGIN_OK, what New(db) loads, and how the server reloads the settings.
tags: [server]
---

The client asks these right after `LOGIN_OK`; before it, they get no answer.
Each cast's commands have their file: `entry_init.go`, `club.go` for hh_club
and `shared.go` for hh_shared.

| Command | Answer |
| --- | --- |
| `GET_INFO` (7) | The user object (5): the habbo's id, name, figure, gender and motto, the user's tickets, an empty pool figure, the user's film, and 1 for direct mail when the user takes the newsletter |
| `GET_CREDITS` (8) | hh_cat_code's purse (6): the user's credits as text |
| `GETAVAILABLEBADGES` (157) | 229: the habbo's badges, then those it wears, each with its slot, 1 to 5 (`knowledge/decisions/server/0083-a-habbo-wears-five-badges-in-slots.md`) |
| `GET_SOUND_SETTING` (228) | 308: 1 when the sound is on, 0 when off |
| `SET_SOUND_SETTING` (229) | Nothing: `game.SetSoundEnabled` saves it, 0 off and any other value on |
| `GET_POSSIBLE_ACHIEVEMENTS` (370) | 436 with no achievement (`knowledge/decisions/server/0051-no-achievements-yet.md`) |
| `SCR_GET_USER_INFO` (26) | 7: `club_habbo`, the days left of the running period, the elapsed periods, the prepaid periods, and the response 1, which opens no window (`knowledge/decisions/server/0052-club-status-by-days-per-month.md`) |
| `GDATE` (49) | 163: today's date in UTC as `dd-mm-yyyy`, which the client asks before and after its login |

- `GETSELECTEDBADGES` (159), which the client sends only after 437, has no
  handler until a phase brings achievements.
- `join` puts every cast's handlers in one map, and a command id with two
  handlers stops the server as it starts.
- A session is the `game.Session` of its habbo. On `game.ConcurrentLogin` it
  sends `HOTEL_LOGOUT` (287) with reason 2, on which the client opens
  `url_logout_concurrent`, and closes the connection.
- A body that cannot be read is logged as an unhandled packet is, by the
  command's name, its id and its size, never its content:
  `r26 127.0.0.1:53422 malformed UNIQUEID (813), 3 bytes`.
- `New(db)` loads the settings and reloads them every `cms.refresh` seconds
  while no database update waits, as the CMS does, so that the Game form's
  changes reach a server running alone
  (`knowledge/decisions/server/0050-the-server-loads-and-reloads-the-settings.md`).
- `New(db)` also loads what every player shares into `virtual`: the
  navigator's categories, models and public rooms, then the furni definitions
  and the catalogue that reads them
  (`knowledge/decisions/server/0098-virtual-furni-and-catalogue.md`). While updates
  wait, it logs
  `server: the navigator and the catalogue wait for the database updates`, and
  the first reload after they are applied loads them
  (`knowledge/decisions/server/0064-the-navigator-loads-once-the-updates-are-applied.md`).
