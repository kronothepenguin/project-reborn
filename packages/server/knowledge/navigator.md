---
type: Reference
title: The navigator
description: The hh_navigator commands the server answers: categories, lists, searches, favourites and own rooms.
tags: [server]
---

`navigator.go` serves hh_navigator once the habbo is logged in, from the shared
data of `virtual/category`, `virtual/model` and `virtual/room` and the store
([hh_navigator](/r26/hh_navigator.md)):

| Command | Answer |
| --- | --- |
| `NAVIGATE` (150) | 220: the category, the categories right under it that the habbo may see, and its public rooms (type 1) or its habbo rooms (type 2), at most `game.categoryMaxRooms`, the busiest first. Node mask 1 leaves full rooms out. A category that does not exist or hides itself from the habbo's level gets no answer |
| `GETUSERFLATCATS` (151) | 221: the categories of habbo rooms below the root that the habbo's level reaches |
| `GETPARENTCHAIN` (156) | 227: the category and those above it, nearest first |
| `GETSPACENODEUSERS` (154) | 223: the names of the habbos in a public room, by index, as Holo listed them |
| `REMOVEALLRIGHTS` (155) | Nothing: the owner's room loses every habbo's rights, from the modify page; those in the room get 43 |
| `SUSERF` (16) | 16: the habbo's own rooms, as lines of text; 57 when it has none. The session's habbo is the one listed, whatever name the client sends |
| `SRCHF` (17) | 55: the rooms whose name holds the query or whose owner it names, at most `game.searchMaxRooms`; 58 when none matches |
| `GET_RECOMMENDED_ROOMS` (264) | 351: three habbo rooms drawn at random (`knowledge/decisions/server/0057-three-random-recommended-rooms.md`) |
| `GETFVRF` (18) | 61: a header node of type 2 with the favourite habbo rooms as its flats, then the favourite public rooms as nodes of type 1, each under its category |
| `ADD_FAVORITE_ROOM` (19) | Nothing: the room, type 1 public or 0 a habbo room, becomes a favourite; past `game.maxFavouriteRooms`, 33 `Only 10 favorite rooms allowed!` (`knowledge/decisions/server/0058-favourites-saved-up-to-30.md`). A room that does not exist changes nothing |
| `DEL_FAVORITE_ROOM` (20) | Nothing: the room stops being a favourite |
| `CREATEFLAT` (29), in `kiosk_room.go` | 59, the new room's id and name on two lines of text, for a room the habbo creates and owns: up to `game.maxRoomsPerHabbo`, a name of 1 to 50 characters without control characters, a model habbos build on, a club one only with `fuse_use_special_room_layouts`, and one of the client's three doors. Otherwise 33 `Error creating a private room`. A new room sits in No category until `SETFLATCAT` (`knowledge/decisions/server/0056-own-rooms-follow-holos-rules.md`) |
| `SETFLATCAT` (153) | Nothing: the owner's room goes to a category its level lets it use |
| `GETFLATINFO` (21) | 54: the room's settings, with `model_<model>` as its marker, the category's trading flag, 0 for the alert no script reads, and 25 as the absolute most visitors, which caps the navigator's modify page. A room that does not exist gets no answer |
| `GETFLATCAT` (152) | 222: the owner's room and its category; another habbo's room gets no answer |
| `UPDATEFLAT` (24) | Nothing: the owner's room takes the name, the door and whether to show the owner, by `CREATEFLAT`'s rules |
| `DELETEFLAT` (23) | Nothing: the owner's room goes, with the favourites that name it, after the furni that stands in it went to the owner's hand, whoever placed it (`knowledge/decisions/server/0059-a-deleted-rooms-furni-goes-to-its-owner.md`) |
| `SETFLATINFO` (25) | Nothing: the owner's room takes the description, cut at 125 characters and without control characters; a password of 1 to 32 characters, stored hashed (`knowledge/decisions/server/0062-room-passwords-are-hashed.md`); whether others move furniture; and 10 to 25 visitors. A change the rules refuse in any field changes nothing. Both the navigator's form, `<id>/`, and the room-o-matic's, `/<id>/`, are read |

- A public room's port is its id, as Holo gave it, which `#room_directory`
  sends back to enter it; its door is 0.
- A category counts the habbos in its rooms from memory, and the most its rooms
  take: its public rooms' and its habbo rooms' `max_visitors`.
- A habbo room that hides its owner shows `-`, except to its owner and to
  holders of `fuse_see_all_roomowners`. A search for the owner's name
  never finds such a room for anyone else.
- 16 and 55 carry a room per line, ended by a carriage return: nine items
  separated by tabs, with `x` for the port and `null` for the filter, as Holo
  wrote them, and the control characters of a name or a description turned into
  spaces.
