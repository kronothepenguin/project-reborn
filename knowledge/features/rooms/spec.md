---
type: Spec
title: Rooms
description: Habbos enter rooms, walk, talk, and are let in, queued, kicked and banned there; loaded rooms stay in the game's memory, and a change made to a room or its furni outside the game reaches it at once.
status: planned
projects: [packages/server, packages/cms, packages/housekeeping, packages/services, packages/virtual, packages/store]
---

# What

Habbos enter public rooms and habbo rooms, see each other, walk, talk, dance and wave. Owners give rights, answer the
doorbell, kick and ban. A full room queues its arrivals and takes spectators. Habbos rate rooms, hold events and ignore
others.

Next:

Rooms are one feature wherever they change ([0010](/decisions/reborn/0010-slices-follow-the-hotels-features.md)).

The user: "something like rooms, i prefer a cache for loaded rooms (rooms with habbos), because placing/moving/picking
furnis, chats, and everything else will be a lot." And, of what needs a service: "something like furnis in a room or
rooms themselves."

It builds on [habbos](/features/habbos/spec.md).

# Behaviours

## Entering

- A habbo enters a public room or an open habbo room: it comes in at the door, sees the habbos inside, and they see it.
- A room loads: the client shows the loading ad and the room ad that staff set in housekeeping, or none
  (decision server/0070).
- A habbo enters a room with a password: the right one lets it in, and a wrong one reads "Incorrect flat password"
  (decision server/0062).
- A habbo rings a room with a closed door: the habbos with rights inside see its name and let it in or turn it away;
  with nobody to answer, it is turned away at once (decision server/0069).
- A banned habbo tries a room: it stays outside (decision server/0067).
- The owner or a staff member with `fuse_enter_locked_rooms` tries a room: it passes any door and any ban.
- A habbo enters its own room: it gets the owner's controls; a habbo with rights gets the furniture controls.
- A habbo leaves, enters another room or logs out: the others see it go (decision server/0071).

## Moving and talking

- A habbo clicks a tile: it walks there a step every 500 ms by the shortest way, around walls and other habbos,
  without cutting corners, up or down at most 1 height (decision server/0065).
- A habbo walks to a seat or a bed: it sits or lies there, facing the furni's way.
- A habbo looks at a tile: it turns to it, unless it sits or lies.
- A habbo chats: habbos within 5 tiles read it, and farther ones see a bubble (decision server/0074).
- A habbo shouts: everyone in the room reads it.
- A habbo whispers to a habbo in the room: only the two of them read it.
- A habbo types: the others see that it types until the line goes or it stops.
- A habbo says a line over 100 characters: the room reads its first 100 (decision server/0078).
- A habbo talks: it moves its mouth, and a smiley shows its face for 5 seconds (decision server/0075).
- A habbo ignores another: it reads none of its lines; past 100 ignored habbos the oldest one drops
  (decision server/0076).
- A habbo dances: it dances, and a club dance needs the club's fuse; a seated or lying habbo stays still.
- A habbo waves: it waves for 1.5 seconds and stops dancing (decision server/0075).
- A habbo talks: staff read the line in housekeeping for 30 days (decision server/0066).

## Rights

- An owner gives or takes a habbo's rights: the habbo gains or loses the furniture controls.
- An owner removes all rights from the navigator's modify page: every habbo loses its rights in the room.
- An owner or a habbo with rights kicks a habbo: it walks to the door and leaves there, or leaves at once when it
  cannot reach the door (decision server/0079).
- A habbo kicks the owner or a staff member with `fuse_any_room_controller`: they stay.
- An owner bans a habbo: it walks out and stays out of the room for 15 minutes (decision server/0067).

## Queue and spectators

- A habbo enters a full room: it waits in the room's queue and sees its place (decision server/0087).
- A club member and another habbo wait for the same room: the club member goes first (decision server/0088).
- A place frees: the next habbo comes in, and its place stays kept until it does (decision server/0087).
- A waiting habbo switches to the spectators' line: it watches the room, with up to 50 others
  (decision server/0089).
- A spectator watches: it sees the habbos and their chat, and has no place and no actions.
- A full room empties: its spectators are sent out, and its queue comes in.

## Rating and events

- A habbo rates a habbo room once: it sees the room's score and the share of up votes (decision server/0082).
- An owner hosts an event of one of 11 types in its room: the room sees it, and the navigator lists it under its type
  (decision server/0081).
- The host leaves the room or logs out: the event ends (decision server/0081).
- A habbo shows its favourite group in a room: the others see the group's badge and read its name and description
  (decision server/0068).
- A habbo reads another's info in a room: it sees the tags of its home on the site.

# Open questions

- What the feature holds: the room changes made on the site or in housekeeping that the game must show at once, and what
  [presence and rooms](/features/presence-and-rooms/spec.md) gives it.
