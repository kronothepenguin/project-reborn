---
type: Reference
title: R26 hh_shared
description: How the R26 client sends calls for help, how staff take them up, answer them and moderate with the mod tool, and how it asks the server's date, shows the server's error reports and passes tracking codes on, from hh_shared's .ls scripts.
timestamp: 2026-11-09T17:46:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T17:42:37+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_shared/`. Below, scripts of this cast are named by their file name, and scripts
of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `1_thread.index.txt` | Three threads, `hobba`, `error_report` and `external_link`, which the thread manager builds when the cast loads |
| `3_Hobba Interface Class.ls` | The calls window (`hobba_alert`) with its blinking alert icon, the reply window, and the mod tool with its button in rooms; sends `MODERATIONACTION` |
| `4_Hobba Component Class.ls` | The calls the client holds, by id; sends `CALL_FOR_HELP`, `PICK_CRYFORHELP`, `FOLLOW_CRYFORHELP`, `CHANGECALLCATEGORY`, `MESSAGETOCALLER`, and `GET_PENDING_CALLS_FOR_HELP`, which `hh_room_utils` registers |
| `5_Hobba Handler Class.ls` | Registers 4 messages and 6 commands: the calls for help and the moderation |
| `7_Server Date Class.ls` | Registers 1 message and 1 command: the server's date. `hh_entry_init/7_Login Component Class.ls` creates it as `#getServerDate` when it connects |
| `55_Error Report Interface Class.ls`, `56_Error Report Component Class.ls` | The error window and the reports it pages through |
| `57_Error Report Handler Class.ls` | Registers 1 message: an error report from the server |
| `63_Statistics Broker Class.ls` | Listens to 1 message, a tracking code it requests as a URL. The login component creates it as `#statsBroker` when the variable `stats.tracking.url` exists |
| `64_Statistics Broker Javascript Class.ls` | Listens to the same message, and passes it to a JavaScript function. The login component creates it as `#statsBrokerJs` when the variable `stats.tracking.javascript` exists |
| `71_OLD Figure System Class.ls` | Registers 1 command, `GETAVAILABLESETS`; no script creates it ([Dead code](#dead-code)) |

Three scripts of this cast send commands that `hh_entry_init` registers, and
[hh_entry_init](/reference/r26/hh_entry_init.md#commands-from-the-client) describes them: `10_CLangTest.ls` sends
`LANGCHECK`, and `20_Ticket Window Manager Class.ls` and `60_Game Oneclick Buy Window Manager Class.ls` send `BTCKS`.

Other scripts are why some of these messages and commands exist:

| Script | Why it is here |
| --- | --- |
| `hh_room_utils/6_Dialog Thread Class.ls` | The player's help dialogs: they send `GET_PENDING_CALLS_FOR_HELP` and, on Send, execute `#sendCallForHelp`, which sends `CALL_FOR_HELP` |
| `hh_room/4_Room Component Class.ls`, `hh_room/5_Room Handler Class.ls` | Remember the caller a staff member followed, and show that user once the room's users hold the name |
| `hh_cat_code/11_Catalogue trophies Class.ls` | Asks for the server's date when the trophy page opens, and writes it on the trophy |
| `hh_human/11_Figure System Class.ls` | Also registers `GETAVAILABLESETS` |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 148 | `handle_cryforhelp` | `#info` | string call id; int category; string time; string sender; string message; string chat log id; string room name; int place type, then by place type: -1 none; 0 string casts, int port, int door; 1 string marker, int room id, string owner; 2 string casts, int port, int door | A call for help for staff ([A call for help](#a-call-for-help)) |
| 149 | `handle_picked_cry` | `#info` | string call id; string picker | The call shows who picked it up |
| 163 | `handle_date` | `#info` | raw: the date, `day-month-year` | [The server's date](#the-servers-date) |
| 166 | `updateStats` (`63_Statistics Broker Class.ls`) and `handle_update_stats` (`64_Statistics Broker Javascript Class.ls`) | `#info` | raw: a tracking code | [Tracking](#tracking) |
| 273 | `handle_delete_cry` | `#info` | string call id | The call leaves the window; with none left, the alert icon goes |
| 274 | `handle_cry_reply` | `#info` | string reply | An alert titled `hobba_message_from`; `<br>` becomes a line break |
| 299 | `handle_error_report` | `#info` | int error id; int message id; string time | [Error reports](#error-reports) |

## The call

`handle_cryforhelp` keeps each field of 148 under the call id, replacing a call of the same id, and leaves its picker
empty:

| Field | What the client does with it |
| --- | --- |
| string call id | The key of the call in the window, and what every command about it sends |
| int category | The window's header and its category button ([Categories](#categories)) |
| string time | Shown under the call while nobody has picked it up |
| string sender | The caller's name, in the header. A call whose sender is exactly `[AUTOMATIC]` is dropped: not kept, no alert |
| string message | Shown in full; each `<br>` becomes a line break |
| string chat log id | Appended to the text `chatlog.url`, which the window's `hobba_seelog` button opens in a new window, for holders of `fuse_see_chat_log_link` |
| string room name | Shown above the message |
| int place type | -1: an instant message, whose window greys out "pick up and go"; 0: a public room; 1: a private room; 2: a game. Any other value reads nothing more |
| string casts (0, 2) | The room's casts, separated by commas |
| int port (0, 2) | |
| int door (0, 2) | Kept as the room id too |
| string marker (1) | |
| int room id (1) | Shown after the room name as `(id: <room id>)` to holders of `fuse_see_flat_ids`, in any place type that has one |
| string owner (1) | |

## Categories

| Category | Header | Category button |
| --- | --- | --- |
| 1 | `hobba_emergency_help` and the sender, in black | `hobba_mark_normal`: shows the alert `hobba_sent_to_helpers` and sends `CHANGECALLCATEGORY` with 2 |
| 2 | `hobba_emergency_help` and the sender, in black | `hobba_mark_normal`: shows the alert `hobba_sent_to_moderators` and sends `CHANGECALLCATEGORY` with 1 |
| 3 | `hobba_cryforhelp` and the sender, in red | `hobba_mark_emergency`, greyed out |
| 4 | `hobba_im_cryforhelp` and the sender, in red | `hobba_mark_emergency`, greyed out |

`CALL_FOR_HELP` sends 1 for an emergency and 2 for a call to the helpers, the two categories the button moves a call
between.

## Error reports

`handle_error_report` reads the error id first. When the variable `reload.client.on.server.errors` is a list that
holds that id, the client goes to the page `client.reload.url` and does nothing else. Otherwise it keeps the report and
opens the error window, which pages through every report since the client started and shows:

- `ID: SERVER-<error id>`;
- the time, on a line of its own;
- the text `error_report_trigger_message`, a colon and the message id.

By its text key, the message id is the id of the message that triggered the error, such as a command the server
could not handle; the client only shows it.

# Commands from the client

All are registered by `5_Hobba Handler Class.ls`, except `GDATE`, registered by `7_Server Date Class.ls`, and
`GETAVAILABLESETS`, registered by `71_OLD Figure System Class.ls`. Every sender calls `send`: with no body it sends the
id alone, and with a typed list it goes through `sendNew`
([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 9 | `GETAVAILABLESETS` | `#info` | `71_OLD Figure System Class.ls`: `getAvailableSetList`, no body | none | Never sent ([Dead code](#dead-code)); `hh_human` registers the same command and sends it nowhere ([s1-22](/tasks/s1-22-human.md)) |
| 48 | `PICK_CRYFORHELP` | `#info` | `4_Hobba Component Class.ls`: `send_cryPick`, typed | string call id | On the window's `hobba_pickup`, `hobba_pickup_go` and `hobba_pickandreply` ([Taking up a call](#taking-up-a-call)) |
| 49 | `GDATE` | `#info` | `7_Server Date Class.ls`: `getDate`, no body | none | [The server's date](#the-servers-date) |
| 86 | `CALL_FOR_HELP` | `#info`, as `connection.room.id` | `4_Hobba Component Class.ls`: `send_cryForHelp`, typed, on `#sendCallForHelp` from `hh_room_utils/6_Dialog Thread Class.ls` | string message; int category: 1 an emergency, 2 for the helpers | [A call for help](#a-call-for-help) |
| 198 | `CHANGECALLCATEGORY` | `#info` | `4_Hobba Component Class.ls`: `send_changeCfhType`, typed | string call id; int new category: 1 or 2 | Only from category 1 or 2 ([Categories](#categories)) |
| 199 | `MESSAGETOCALLER` | `#info` | `4_Hobba Component Class.ls`: `send_CfhReply`, typed | string call id; string reply | [Answering a call](#answering-a-call) |
| 200 | `MODERATIONACTION` | `#info` | `3_Hobba Interface Class.ls`: `sendModCommand`, typed | int target: 0 a user, 1 the room; int action: 0 alert, 1 kick, 2 ban; then by action, below | [The mod tool](#the-mod-tool) |
| 323 | `FOLLOW_CRYFORHELP` | `#info` | `4_Hobba Component Class.ls`: `send_cryPick`, typed | string call id | After `PICK_CRYFORHELP`, on `hobba_pickup_go` ([Taking up a call](#taking-up-a-call)) |

`MODERATIONACTION`'s fields after the target and the action:

| Mod tool view | Target | Action | Then |
| --- | --- | --- | --- |
| Alert a user | 0 | 0 | string reason; string extra info; string name |
| Kick a user | 0 | 1 | string reason; string extra info; string name |
| Ban a user | 0 | 2 | string reason; string extra info; string name; int hours; int ban the computer: 0 or 1; int ban the IP address: 0 or 1 |
| Alert the room | 1 | 0 | string reason; string extra info |
| Kick from the room | 1 | 1 | string reason; string extra info |

# Flows

## A call for help

1. A player's help dialogs, in `hh_room_utils`, send `GET_PENDING_CALLS_FOR_HELP` (237). The server answers 319 with
   the number of the player's calls still waiting, and the dialog for writing opens only on 0; otherwise the player
   may first delete them with `DELETE_PENDING_CALLS_FOR_HELP` (238), which 320 answers. These belong to
   `hh_room_utils` ([s1-07](/tasks/s1-07-room-utils.md)).
2. On Send, the dialog executes `#sendCallForHelp` with the text and its kind, and `send_cryForHelp` sends
   `CALL_FOR_HELP`: the text with every `/` turned into a space and every line break into `<br>`, run through
   `convertSpecialChars` ([fuse_client](/reference/r26/fuse_client.md#text)), then 1 for `#emergency` or 2 for
   `#habbo_helpers`. The server answers 321, whose status 0 opens `hh_room_utils`' dialog saying the call was sent.
3. The server sends 148 to the clients that take calls. The client checks no right before it shows a call: whoever
   gets 148 sees it. It plays `sound_cfh_received` while the mod tool's audio alert is on, as it is when the client
   starts, and shows the alert icon at the top of the screen, which blinks while a call has no picker. A click on it
   opens the calls window, one call a page.

## Taking up a call

1. `hobba_pickup` sends `PICK_CRYFORHELP` with the call id. `hobba_pickandreply` sends it too, and opens the reply
   window ([Answering a call](#answering-a-call)).
2. The server sends 149 with the call id and the picker's name, and the window shows `hobba_pickedby` and the name in
   place of the time. A 149 for a call the client does not hold changes nothing.
3. `hobba_pickup_go` sends `PICK_CRYFORHELP`, then checks the call: its picker, chat log id, room name, call id and
   message must be strings, and its place type one of the four above. When they are, it executes `#pickAndGoCFH` with
   the caller's name, which `hh_room/4_Room Component Class.ls` remembers, and sends `FOLLOW_CRYFORHELP` with the call
   id. Otherwise it logs "Invalid or missing data in saved help cry!" and sends nothing more.
4. The client does not move by itself. When it next receives a room's users and one has the remembered name,
   `hh_room/5_Room Handler Class.ls` forgets the name and, three seconds later, points the room's arrow at that user
   ([s1-06](/tasks/s1-06-room.md)). Moving a client to a room is what `hh_navigator`'s `handle_roomforward` (286)
   does ([s1-04](/tasks/s1-04-navigator.md)).
5. The server sends 273 with the call id when the call leaves the window.

## Answering a call

1. The reply window shows `hobba_reply_cfh` with the caller's name, and the call's message. Its field stops taking
   keys, Backspace and Delete aside, once it holds 512 characters or 5 lines.
2. `hobba_reply_button` sends `MESSAGETOCALLER` with the call id and the reply, after `send_CfhReply` has turned the
   first space after every 45 characters into `<br>`, every line break into `<br>`, and run the text through
   `convertSpecialChars`. The window goes back to the calls.
3. The caller's client gets 274 with the reply, and shows it in an alert titled `hobba_message_from`.

## The mod tool

1. A client that enters a room shows the mod tool button beside the alert icon when its rights hold `fuse_kick`
   ([hh_entry_init](/reference/r26/hh_entry_init.md#rights)). The button leaves with the room, and while a game runs.
2. The mod tool's main view offers alert, kick and ban for a user, and alert and kick for the room. A click on a user
   in the room writes that user's name in the name field, unless it is the staff member's own name.
3. The reason field stops taking keys as the reply's does. A ban chooses 2, 4, 12 or 24 hours, or 2, 3, 7, 14, 21,
   30, 60, 365 or 730 days, sent in hours, or 100000 hours for the last choice, which the window calls 4167 days; and
   whether to ban the computer and the IP address.
4. OK sends `MODERATIONACTION` and the window goes back to its main view. The client waits for nothing in return.

## The server's date

1. When the catalogue's trophy page opens, `hh_cat_code` calls `getDate`, which sends `GDATE`.
2. The server sends 163 with the date as `day-month-year`, such as `09-11-2026`. A body that does not hold three items
   between dashes is ignored.
3. The client keeps it in the session as `server_date`, with dots for dashes, and executes `#serverDate`, on which the
   trophy page writes the date in the format of session parameter 5
   ([hh_entry_init](/reference/r26/hh_entry_init.md#session-parameters)), the day, the month and the year as numbers.

## Tracking

The server sends 166 on its own: no command asks for it.

- `63_Statistics Broker Class.ls` puts the body in place of `\TCODE` in the variable `stats.tracking.url` and loads
  that address.
- `64_Statistics Broker Javascript Class.ls` calls the JavaScript function named by the variable
  `stats.tracking.javascript` with the body, put in place of `\TCODE` in the variable
  `stats.tracking.javascript.template` when it exists.

Either runs only when its variable exists, and both run when both do. The second also passes on the client's own
tracking points, such as `/client/loggedin`, prefixed with session parameter 8, without the server.

# Notes

## Counts

`5_Hobba Handler Class.ls` registers 4 messages and 6 commands, `7_Server Date Class.ls` 1 and 1,
`57_Error Report Handler Class.ls` 1 and 0, `63_Statistics Broker Class.ls` and
`64_Statistics Broker Javascript Class.ls` 1 and 0 each, and `71_OLD Figure System Class.ls` 0 and 1. All match
[Registering scripts](/reference/client-r26.md#registering-scripts).

## Ids other casts register too

- 9: `hh_human/11_Figure System Class.ls`, whose class the login creates as `Figure_System`, registers
  `GETAVAILABLESETS` too and never sends it ([s1-22](/tasks/s1-22-human.md)). The only sender is this cast's
  `getAvailableSetList`, which never runs, so no client sends 9.
- 166: both statistics brokers of this cast listen to it.
- 237: `GET_PENDING_CALLS_FOR_HELP` is registered by `hh_room_utils/7_Dialog Handler Class.ls`, and sent by this cast's
  `getPendingCFHs` as well as by `hh_room_utils`' dialogs ([s1-07](/tasks/s1-07-room-utils.md)).

## Dead code

- No script creates `71_OLD Figure System Class.ls`: the login creates `Figure_System` from `hh_human`'s
  `Figure System Class`. So its `getAvailableSetList` never sends `GETAVAILABLESETS`, and nothing calls its
  `setAvailableSetList`, which would execute `#figure_ready`.
- `4_Hobba Component Class.ls`' `getPendingCFHs`, which sends `GET_PENDING_CALLS_FOR_HELP`, is called by no script.
- `send_cryPick` builds, for "pick up and go", a room id, a node type, a flat id, the casts and a unit name from the
  call, and never uses them: only the caller's name leaves it, with `#pickAndGoCFH`.

## Quirks

- `send_cryPick` copies the stored call before it checks that the call exists, so "pick up and go" on a call the
  client no longer holds fails in Lingo instead of in its own check.
- A 148 whose place type is not -1 to 2 keeps the call without a type, and "pick up and go" then fails its check after
  `PICK_CRYFORHELP` has gone out.
- `send_CfhReply` counts the 45 characters again after each `<br>` it writes, counting the `br>` it adds among them,
  and stops at the reply's first length, so the end of a long reply is not broken.
- `handle_cry_reply` runs the reply through `convertSpecialChars` again, after `fuse_client` already has
  ([fuse_client](/reference/r26/fuse_client.md#text)).
- `64_Statistics Broker Javascript Class.ls` listens to 166 with `#handle_update_stats` and stops listening with
  `#updateStats`.
- The Hobba Interface stops listening to `#userlogin`, which it never listened to, and goes on listening to
  `#enterRoom` and `#leaveRoom` after it is gone.
- The mod tool sends whatever its fields hold, empty ones too; it checks nothing before `MODERATIONACTION`.
