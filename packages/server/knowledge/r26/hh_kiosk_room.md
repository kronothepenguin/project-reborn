---
type: Reference
title: R26 hh_kiosk_room
description: How the R26 client creates a room in the Roommatic kiosk, names it, sets its category, model and door, receives its number and goes in, from hh_kiosk_room's .ls scripts.
timestamp: 2026-11-09T18:54:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:54:04+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_kiosk_room/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_RoomKiosk Interface Class.ls` | The Roommatic's pages: name and description, category, model, door and password, and the new room's number; builds `CREATEFLAT` and `SETFLATINFO` |
| `4_RoomKiosk Component Class.ls` | Sends `CREATEFLAT`, `SETFLATINFO` and `SETFLATCAT`, and opens the kiosk after the login when the variable `shortcut.id` is 1 |
| `5_RoomKiosk Handler Class.ls` | Registers 3 messages and 1 command, in `construct`, with lists of its own |
| `39_Roommatic Class.ls` | The Roommatic as an object in a room: a click walks the user next to it, turns them to it and opens the kiosk |

Other casts register the two other commands this cast sends, and listen to the same id:

| Script | Why it is here |
| --- | --- |
| `hh_navigator/6_Navigator Handler Class.ls` | Registers `SETFLATINFO` and `SETFLATCAT`, and also listens to 33 ([hh_navigator](/r26/hh_navigator.md)) |
| `hh_navigator/5_Navigator Component Class.ls` | `roomkioskGoingFlat` enters the new room, and `sendGetOwnFlats` lists the own rooms; the navigator's room lists open the kiosk |
| `hh_room/5_Room Handler Class.ls` | Registers `MOVE` and `LOOKTO`, which the Roommatic object sends (s1-06) |
| `hh_entry_init/8_Login Handler Class.ls`, `hh_room/5_Room Handler Class.ls` | Also listen to 33 |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 33 | `handle_error` | `#info` | raw: the error text | `Error creating a private room` shows `roomatic_create_error` and closes the kiosk; any other text is ignored here |
| 59 | `handle_flatcreated` | `#info` | raw: the flat id, the first word of the first line; the name, the second line | [Creating a room](#creating-a-room) |
| 353 | `handle_webShortcut` | `#info` | int request: 1 opens the kiosk | Any other request does nothing |

# Commands from the client

Registered by `5_RoomKiosk Handler Class.ls`. Its sender calls `send` with text, which is the whole body
([fuse_client](/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 29 | `CREATEFLAT` | `#info` | `4_RoomKiosk Component Class.ls`: `sendNewRoomData`, text | raw: `/first floor/<name>/model_<model>/<door>/<show owner name>` | [Creating a room](#creating-a-room) |

This cast also sends two commands that `hh_navigator` registers, and whose rows list it among their senders
([hh_navigator](/r26/hh_navigator.md#commands-from-the-client)):

- `SETFLATINFO` (25), as text: `/<flat id>/`, then the lines `description=…`, `password=…` and `allsuperuser=…`.
  Unlike the navigator's, it starts with a `/`, always has a `password=` line, empty unless the door is `password`,
  and has no `maxvisitors=` ([hh_navigator](/r26/hh_navigator.md#changing-a-room)).
- `SETFLATCAT` (153), typed: int flat id; int category id, the category chosen on the first page.

# Flows

## Opening the kiosk

The kiosk opens on `#open_roomkiosk`, which comes from:

- the navigator's create-room buttons;
- a click on the Roommatic in a room: the user walks next to it with `MOVE`, turns to it with `LOOKTO` and the kiosk
  opens;
- 353 with request 1;
- the login, 2.5 seconds after it, when the variable `shortcut.id` is 1.

## Creating a room

1. The first page takes the name, without its `/` characters, and the description, and offers whether to show the
   owner's name, 1 by default. An empty name stops with `roomatic_givename`.
2. The second page chooses the category from the session's `user_flat_cats`, which `hh_navigator` fills from 221,
   the answer to `GETUSERFLATCATS`.
3. The third page chooses the model from the variable `private.room.properties`, a list of `#model`, `#size` and
   `#club`. A club model goes on only for holders of the right `fuse_use_special_room_layouts`.
4. The fourth page chooses the door, `open` by default, `closed` or `password`, the password being typed twice, up
   to 32 characters of the variable `permitted.name.chars`; and whether others may move furniture, `0` by default.
5. The client sends `CREATEFLAT`: `/first floor/`, then the name, `model_` and the model, the door as text and the
   show owner name flag, each with its `/` turned into a space, separated by `/`. The name and the description go
   through `convertSpecialChars` first.
6. The server answers 59 with the new flat's id and name, or 33 `Error creating a private room`.
7. On 59 the client sends `SETFLATCAT` with the flat id and the category, shows the room's number and name, and sends
   `SETFLATINFO` with the description, the password and whether others may move furniture.
8. Go enters the new room through the navigator; Cancel lists the own rooms with `SUSERF`.

# Notes

## Counts

`5_RoomKiosk Handler Class.ls` registers 3 messages and 1 command, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says.

## Ids other casts register too

- 33: `hh_entry_init`, `hh_navigator` and `hh_room` also listen, each comparing the whole text with texts of their own
  ([hh_entry_init](/r26/hh_entry_init.md#ids-other-casts-register-too)).
- `SETFLATINFO` and `SETFLATCAT` are registered by `hh_navigator`, which sends them too.

## Quirks

- `CREATEFLAT` starts with a fixed floor, `first floor`, before the name.
- The kiosk's `SETFLATINFO` differs from the navigator's in its first line and its lines, so the server parses the
  two forms.
- 59 is text, the id and the name on two lines, where the navigator's answers are typed.
