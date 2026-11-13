---
type: Reference
title: R26 hh_room_utils
description: How the R26 client's help dialogs check for a waiting call for help, delete it and send a new one, how a one-way door opens and shuts, and how room chat, whispers and shouts travel, from hh_room_utils' .ls scripts.
timestamp: 2026-11-09T18:47:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:43:01+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_room_utils/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `6_Dialog Thread Class.ls` | The help dialogs: the help choices, the call for help, the waiting call and the confirmation |
| `7_Dialog Handler Class.ls` | Registers 3 messages and 2 commands: the waiting calls for help |
| `23_OneWayDoor Manager Class.ls` | Registers 1 message and 1 command: one-way doors |
| `25_Chat Manager.ls` | Registers 3 messages and 3 commands: room chat |
| `26_Chat Display.ls` and the chat bubble classes | Draw the chat |

This cast holds many of the room's tools, and they send commands that `hh_room/5_Room Handler Class.ls` registers, so
their rows are in that cast's document (s1-06): the safe trader (`TRADE_ACCEPT`,
`TRADE_ADDITEM`, `TRADE_CLOSE`, `TRADE_UNACCEPT`), the hand and the object mover (`GETSTRIP`, `ADDSTRIPITEM`,
`FLATPROPBYITEM`), the badge manager (`SETBADGE`), the ignore list (`GET_IGNORE_LIST`, `IGNOREUSER`,
`UNIGNORE_USER`), the doorbell (`LETUSERIN`), group info (`GET_GROUP_DETAILS`, `GET_GROUP_BADGES`) and the room
event browser (`CAN_CREATE_ROOMEVENT`, `CREATE_ROOMEVENT`, `EDIT_ROOMEVENT`).

Other casts send this cast's commands, and register the same ones:

| Script | Why it is here |
| --- | --- |
| `hh_room/4_Room Component Class.ls` | `sendChat` sends `CHAT`, `SHOUT` and `WHISPER`, naming the command by the chat mode |
| `hh_room/5_Room Handler Class.ls` | Registers `CHAT`, `SHOUT` and `WHISPER` too, with the same ids |
| `hh_furni_classes/59_Furniture OneWayDoor Class.ls` | Sends `ENTER_ONEWAY_DOOR`, and shows the door's state |
| `hh_shared/4_Hobba Component Class.ls` | Sends `CALL_FOR_HELP` on `#sendCallForHelp` ([hh_shared](/r26/hh_shared.md#a-call-for-help)), and `GET_PENDING_CALLS_FOR_HELP` from `getPendingCFHs`, which no script calls ([hh_shared](/r26/hh_shared.md#dead-code)) |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 24 | `handle_chat` (`25_Chat Manager.ls`) | `#info`, as `connection.room.id` | int user's room index; string text | Chat. An empty text shows as `UNHEARD`. Ends the user's typing |
| 25 | `handle_chat` (`25_Chat Manager.ls`) | `#info`, as `connection.room.id` | int user's room index; string text | A whisper, as 24 |
| 26 | `handle_chat` (`25_Chat Manager.ls`) | `#info`, as `connection.room.id` | int user's room index; string text | A shout, as 24 |
| 312 | `changeStatus` (`23_OneWayDoor Manager Class.ls`) | `#info` | int door's object id; int status: 0 or 1 | The door's state; any other status is refused |
| 319 | `handle_get_pending_response` (`7_Dialog Handler Class.ls`) | `#info` | int count; when not 0, string id, string time, string text of the waiting call | The answer to `GET_PENDING_CALLS_FOR_HELP` |
| 320 | `handle_pending_CFHs_deleted` (`7_Dialog Handler Class.ls`) | `#info` | none | The answer to `DELETE_PENDING_CALLS_FOR_HELP`: the dialog to write a call opens |
| 321 | `handle_cfh_sending_response` (`7_Dialog Handler Class.ls`) | `#info` | int status: 0 sent | The answer to `CALL_FOR_HELP`: on 0 the dialog confirms; any other status does nothing |

# Commands from the client

Registered by the three scripts above. Every sender calls `send`: with no body it sends the id alone, and with a
typed list it goes through `sendNew` ([fuse_client](/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 52 | `CHAT` | `#info`, as `connection.room.id` | `hh_room/4_Room Component Class.ls`: `sendChat`, typed | string text, through `convertSpecialChars` | [Chat](#chat) |
| 55 | `SHOUT` | `#info`, as `connection.room.id` | `hh_room/4_Room Component Class.ls`: `sendChat`, typed | string text, through `convertSpecialChars` | Shift held, or the shout mode |
| 56 | `WHISPER` | `#info`, as `connection.room.id` | `hh_room/4_Room Component Class.ls`: `sendChat`, typed | string: the name of the selected user, a space, the text through `convertSpecialChars` | The whisper mode |
| 232 | `ENTER_ONEWAY_DOOR` | `#info` | `hh_furni_classes/59_Furniture OneWayDoor Class.ls`: `select`, typed | int door's object id | A double click while standing in front of the door |
| 237 | `GET_PENDING_CALLS_FOR_HELP` | `#info` | `6_Dialog Thread Class.ls`: `showDialog`, no body; `6_Dialog Thread Class.ls`: `helpChoiceMade`, no body; `hh_shared/4_Hobba Component Class.ls`: `getPendingCFHs`, no body | none | Answered by 319 |
| 238 | `DELETE_PENDING_CALLS_FOR_HELP` | `#info` | `6_Dialog Thread Class.ls`: `eventProcCallHelp`, no body | none | Answered by 320 |

# Flows

## A call for help

1. The help window offers the choices `help_pointer_<n>`: a page to open, `hotel_help` or `emergency_help`. With no
   choice defined, every call is an emergency.
2. `hotel_help` and `emergency_help` send `GET_PENDING_CALLS_FOR_HELP`. 319 with a count of 0 opens the dialog to write
   the call; otherwise it shows the waiting call's text, which the user may delete with `DELETE_PENDING_CALLS_FOR_HELP`,
   after which 320 opens the dialog to write.
3. Send executes `#sendCallForHelp`, and `hh_shared` sends `CALL_FOR_HELP`
   ([hh_shared](/r26/hh_shared.md#a-call-for-help)). 321 with status 0 shows `callhelp_sent` or
   `help_emergency_sent`, by the kind of call.

## Chat

`hh_room`'s `sendChat` sends what the user types as `CHAT`, `SHOUT` (Shift held, or the shout mode) or `WHISPER` (the
whisper mode, with the selected user's name in front), its text through `convertSpecialChars`
([fuse_client](/r26/fuse_client.md#text)), after the client's own chat commands, which `hh_room` handles
(s1-06). A moderator command of the variable `moderator.cmds` goes as `CHAT`, its `x`
replaced by the selected user's name. Each user's line comes back as 24, 25 or 26 with their room index.

## One-way doors

A click on a one-way door walks the user in front of it with `MOVE`; a double click there sends `ENTER_ONEWAY_DOOR`.
312 sets the door's state, 0 or 1, which picks the door's graphics.

# Notes

## Counts

`7_Dialog Handler Class.ls` registers 3 messages and 2 commands, `23_OneWayDoor Manager Class.ls` 1 and 1, and
`25_Chat Manager.ls` 3 and 3, as Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says.

## Ids other casts register too

- `CHAT` (52), `SHOUT` (55) and `WHISPER` (56): `hh_room/5_Room Handler Class.ls` registers them too, with the same
  ids.

## Quirks

- 319 carries one waiting call after its count, whatever the count.
- A chat line with empty text shows in the mode `UNHEARD`.
- With no user selected, a whisper's text starts with a space: the name in front of it is empty.
- The chat commands' names are the chat modes themselves: `sendChat` sends the mode as the command's name.
