---
type: Go Package
title: Game
description: The rules of packages/server/internal/game, the events they send sessions and the functions each protocol calls.
tags: [server]
---

`game` holds the rules, which each protocol's handlers call. A rule changes the
state in `packages/virtual` and writes the database, and reaches a habbo's
client through its `Session` (`knowledge/decisions/server/0039-rules-notify-sessions-through-an-interface.md`).

- `Session` is the interface `virtual/habbo` declares, `Notify(event any)`
  (`knowledge/decisions/server/0048-sessions-through-an-interface-virtual-declares.md`).
  Each protocol's session implements it on a pointer and turns every event into
  its messages.
- The events are structs of `game`. `ConcurrentLogin{}` tells a session that its
  habbo logged in on another one, which replaces it; `r26` answers it with 287,
  reason 2 (`knowledge/decisions/server/0029-a-second-login-closes-the-first.md`).
- `Login(ctx, db, s, ticket, machineID)` spends the SSO ticket and returns the
  habbo it names, online on `s`. In one transaction it spends the ticket, reads
  the habbo, its badges and its sound setting, and saves the machine id, when
  `s` holds one, and the last time online; after the commit it reads the fuses
  with `auth.Fuses`. Then the habbo goes online with them
  (`knowledge/decisions/server/0053-the-online-habbo-holds-its-own-data.md`), and
  the session it was online on leaves its room and gets `ConcurrentLogin`. A
  ticket that is unknown, spent, or whose CMS session ended or moved to another
  habbo returns `ErrInvalidTicket`.
- `Logout(ctx, db, s, avatarID)` takes the habbo out of its room, writes its
  last time online and takes it offline, while `s` plays it. A session that a
  second login replaced logs nothing out: the second login took it out of its
  room.
- Entering a room: `ChooseRoom` heads the habbo for a room, out of the one it is
  in, and admits it to a public room; `TryFlat` answers a habbo room's door with
  an `Admission`; `AnswerDoorbell` lets a ringer in or turns it away;
  `GoToFlat` gives a habbo room's model and the habbo's rights in it;
  `Arrival` and `Visitors` give the room's model and who is in it while the
  client builds it; `EnterRoom` brings the habbo in; `LeaveRoom` takes it out;
  and `PublicRoomVisitors` names who is in a public room. The way into a room
  is a `room.Heading` of `virtual/room`, so that only a habbo whose door let it
  through comes in.
- Their events: `RoomEntered`, `RoomLeft`, `DoorbellRang`, `DoorbellAnswered`,
  `LetIn`, `TurnedAway` and `Kicked`.
- `DeleteRoom` sends the habbos in the room out.
- `PruneChat(ctx, db, now)` deletes the chat lines older than
  `game.chatHistoryDays`, 30; `server.New` runs it at once and every hour, once
  the database updates are applied
  (`knowledge/decisions/server/0084-the-game-server-prunes-the-chat-hourly.md`).
  Housekeeping's Chat Log Viewer reads the lines.
- `DeleteEndedRoomBans(ctx, db, now)` deletes the room bans that ended;
  `server.New` runs it every minute, once the database updates are applied, as
  the CMS and housekeeping delete expired sessions.
- Chat: `Say`, `Shout` and `Whisper` send `Chat` events; `SetTyping` sends
  `Typing`; `Dance`, `StopDancing` and `Wave` change statuses; `Ignore`,
  `Unignore` and `IgnoreList` keep the ignore list, saved and in the online
  habbo, which `Login` loads.
- Rights: `AssignRights`, `RemoveRights` and `RemoveAllRights` send
  `RightsChanged`; `Kick` and `Ban` send a habbo walking out, and the room's
  clock sends it `Kicked` and takes it out once it stops.
- Badges: `SetBadges` saves the five slots and sends `BadgesChanged`.
- Queue: full rooms call `joinQueue`, and every place that frees `serveLines`,
  which sends `QueueChanged` and `QueueAdmitted`; `ChangeQueue` moves a habbo
  between the lines; `SpectatorCount` counts the spectators; the room's events
  reach its spectators too, and `SpectatorsRemoved` lets them go.
- Extras: `RoomRating` and `RateRoom` with `RatingChanged`; `CanHostEvent`,
  `HostEvent`, `EndEvent`, `RoomEvent`, `Events` and `EventTypes` with
  `RoomEventChanged`; `GroupBadges`, `GroupDetails` and `UserTags`.
- Walking: `EnterRoom` starts a room's clock when its entry loads the room;
  `Walk` sets a habbo's goal and `LookTo` turns it; the clock's ticks send
  `Statuses`.
- `UserAccount(ctx, db, userID)` reads what the client shows of the user behind
  a habbo, which all the user's habbos share: the credits, the tickets, the film
  and whether the user takes the newsletter.
- `ClubStatus(ctx, db, userID)` reads the user's club: the days left of the
  running period, the whole periods of club the user has had and the whole
  periods prepaid, in periods of `club.daysPerMonth` days. The days left are
  those the CMS shows: 40 of them with months of 31 days are 9 days and 1
  prepaid period.
- `SendLook(ctx, db, avatarID)` reads the habbo again after a change outside the
  game (decision reborn/0013). While it is online, `habbo.Update` sets the
  figure, gender and motto of the copy the game holds; its session gets
  `OwnLookChanged`, with the account its client shows beside them, and its room
  gets `LookChanged`, with its index. An offline habbo gets nothing, and its
  next login reads the store. A second login between the read and the update
  wins: the session it replaced gets nothing.
- `SendPurse(ctx, db, userID)` reads the user's purse again after a change
  outside the game. Each of the user's habbos in the hotel gets `PurseChanged`,
  with the account and the habbo, which r26 sends as the user object (5), with
  the tickets and the film, the film (4) for the camera, and the credits (6),
  which the client shows with its cash sound. A user with no habbo in the hotel
  gets nothing, and its next login reads the store.
- `SetSoundEnabled(ctx, db, s, avatarID, on)` saves the sound setting, then that
  of the online habbo while `s` plays it.

```go
h, err := game.Login(ctx, db, s, ticket, machineID)
if errors.Is(err, game.ErrInvalidTicket) {
	// refuse the login
}

// once the client is gone
if err := game.Logout(ctx, db, s, h.ID); err != nil {
	slog.Warn(err.Error())
}
```
