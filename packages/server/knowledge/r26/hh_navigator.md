---
type: Reference
title: R26 hh_navigator
description: How the R26 client browses the navigator's public and private categories, lists its own rooms, searches and keeps favourites, reads and changes a room's settings, deletes a room, enters a room or is refused, and is forwarded, from hh_navigator's .ls scripts.
timestamp: 2026-11-09T18:19:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:19:28+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_navigator/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Navigator Window Interface Class.ls` | The navigator window and its views |
| `4_Navigator Roomlist Interface Class.ls` | The room lists, the tabs (public rooms, guest rooms, search, own rooms, favourites), the room info, the password prompt, and the pages that modify and delete an own room |
| `5_Navigator Component Class.ls` | The node cache, the state after the login, room entry, and every send of the cast |
| `6_Navigator Handler Class.ls` | Registers 18 messages and 18 commands |
| `7_Navigator Info Broker Class.ls` | Fetches a room's data for other scripts, on `#requestRoomData`, and calls them back |

Other casts send two of these commands, and one listens to the same id:

| Script | Why it is here |
| --- | --- |
| `hh_kiosk_room/4_RoomKiosk Component Class.ls` | Sends `SETFLATINFO` and `SETFLATCAT` for a room it has just created ([s1-05](/tasks/s1-05-kiosk-room.md)) |
| `hh_kiosk_room/3_RoomKiosk Interface Class.ls` | Calls `sendGetOwnFlats`, and reads the session's `user_flat_cats` |
| `hh_room/5_Room Handler Class.ls` | Passes `incorrect flat password` and `Password required!` from 33 to `flatAccessResult` ([s1-06](/tasks/s1-06-room.md)) |
| `hh_room/4_Room Component Class.ls` | Asks the info broker for a flat's data before a teleport |
| `hh_room_ui/27_Navigator Popup Class.ls`, `hh_room_utils/32_RoomEvent Browser Class.ls`, `hh_room_utils/11_Group Info Class.ls`, `hh_tutorial/14_NUH Component Class.ls` | Execute `#roomForward`, which enters a room through this cast |
| `hh_entry_init/8_Login Handler Class.ls`, `hh_kiosk_room/5_RoomKiosk Handler Class.ls`, `hh_room/5_Room Handler Class.ls` | Also listen to 33 ([hh_entry_init](/reference/r26/hh_entry_init.md#ids-other-casts-register-too)) |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 16 | `handle_flat_results` | `#info` | raw: [a list of flats](#flat-lists-as-text) | The user's own rooms, the answer to `SUSERF` |
| 33 | `handle_error` | `#info` | raw: the error text | `Only 10 favorite rooms allowed!` or `nav_error_toomanyfavrooms` shows `nav_error_toomanyfavrooms`; any other text is only logged here |
| 54 | `handle_flatinfo` | `#info` | int others may move furniture; int door; int flat id; string owner; string marker; string name; string description; int show owner name; int trading; int alert; int max visitors; int absolute max visitors | [A flat's settings](#a-flats-settings) |
| 55 | `handle_flat_results` | `#info` | raw: [a list of flats](#flat-lists-as-text) | The search results, the answer to `SRCHF` |
| 57 | `handle_noflatsforuser` | `#info` | none | The list shows `nav_private_norooms` |
| 58 | `handle_noflats` | `#info` | none | The list shows `nav_prvrooms_notfound` |
| 61 | `handle_favouriteroomresults` | `#info` | int node mask; a node header: int id, int type, string name, int user count, int max users, int parent id; for type 2, [a flat list](#flat-lists); then [nodes](#nodes) | The favourites, the answer to `GETFVRF` |
| 130 | `handle_flatpassword_ok` | `#info` | none | The password was right ([Entering a room](#entering-a-room)) |
| 220 | `handle_navnodeinfo` | `#info` | int node mask; then [nodes](#nodes), the first being the category asked for | The answer to `NAVIGATE` |
| 221 | `handle_userflatcats` | `#info` | int n, then n × (int category id; string name) | The categories a user may put a room in, kept in the session as `user_flat_cats` |
| 222 | `handle_flatcat` | `#info` | int flat id; int category id | The answer to `GETFLATCAT`; executes `#flatcat_received` |
| 223 | `handle_spacenodeusers` | `#info` | int node id; int n, then n × string name | The users in a public room, the answer to `GETSPACENODEUSERS` |
| 224 | `handle_cantconnect` | `#info` | int reason; for 3, string queue set | The client leaves the room it was entering ([Entering a room](#entering-a-room)) |
| 225 | `handle_success` | `#info` | int message id | Read and ignored |
| 226 | `handle_failure` | `#info` | int message id; string text | An alert with the text, unless it is empty |
| 227 | `handle_parentchain` | `#info` | int node id; string name; then pairs of int parent id and string name, up to an id of 0 or less | The answer to `GETPARENTCHAIN`: the categories above a node, nearest first |
| 286 | `handle_roomforward` | `#info` | int public: above 0 for a public room; int room id | [Forwarding](#forwarding) |
| 351 | `handle_recommended_room_list` | `#info` | int n, then n × (int flat id; string name; string owner; string door; int user count; int max users; string description) | The answer to `GET_RECOMMENDED_ROOMS`. Rooms past the third are not read |

## Nodes

The navigator is a tree of nodes. `parseNode` reads one:

| Field | Notes |
| --- | --- |
| int id | 0 or less ends the list of nodes |
| int type | 0 a category, 1 a public room, 2 a category of flats |
| string name | |
| int user count | |
| int max users | |
| int parent id | |
| for type 1: string unit, int port, int door, string casts, int users in queue, bool visible | The casts are separated by commas |
| for type 2: [a flat list](#flat-lists) | The client keeps the node as a category, type 0 |

A message of nodes is read node after node until a node's id is 0 or less, or the body ends, which reads as 0.
In 220, the first node is the category asked for; each later node whose parent is that category becomes one of its
children, and every category met is kept in the client's index of categories.

## Flat lists

A flat list in a node of type 2 or in 61 is an int count, then for each flat:

| Field | Notes |
| --- | --- |
| int flat id | The client names the node `f_<flat id>` |
| string name | |
| string owner | |
| string door | `open`, `closed` or `password`, as text |
| int user count | |
| int max users | |
| string description | |

## Flat lists as text

16 and 55 carry their flats as lines of text, each with 9 items separated by tabs: flat id, name, owner, door, port,
user count, max users, filter, description. A line with 1 to 8 items is skipped, and an empty line ends the list.

## A flat's settings

`handle_flatinfo` turns door 0 into `open`, 1 into `closed` and 2 into `password`, and a max visitors below 1 into 25
and an absolute max visitors below 1 into 50. It updates the cached node, and calls back whoever asked the info broker
for the flat.

# Commands from the client

All are registered by `6_Navigator Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone,
with text the text is the whole body, and with a typed list it goes through `sendNew`
([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 13 | `SBUSYF` | `#info` | no script | — | Registered only |
| 16 | `SUSERF` | `#info` | `5_Navigator Component Class.ls`: `sendGetOwnFlats`, text | raw: the user's name | The own rooms tab; answered by 16 or 57 |
| 17 | `SRCHF` | `#info` | `5_Navigator Component Class.ls`: `sendSearchFlats`, text | raw: the query, through `convertSpecialChars` | The search tab; an empty query sends nothing; answered by 55 or 58 |
| 18 | `GETFVRF` | `#info` | `5_Navigator Component Class.ls`: `sendGetFavoriteFlats`, typed | bool: always false | The favourites tab, and after each change to the favourites; answered by 61 |
| 19 | `ADD_FAVORITE_ROOM` | `#info` | `5_Navigator Component Class.ls`: `sendAddFavoriteFlat`, typed | int type: 1 a public room, 0 a flat; int room or flat id | Then `GETFVRF`. A full list answers 33 |
| 20 | `DEL_FAVORITE_ROOM` | `#info` | `5_Navigator Component Class.ls`: `sendRemoveFavoriteFlat`, typed | int type: 1 a public room, 0 a flat; int room or flat id | Then `GETFVRF` |
| 21 | `GETFLATINFO` | `#info` | `5_Navigator Component Class.ls`: `sendGetFlatInfo`, text | raw: the flat id | Through the info broker; answered by 54 |
| 23 | `DELETEFLAT` | `#info` | `5_Navigator Component Class.ls`: `sendDeleteFlat`, text | raw: the flat id | After three questions; then `SUSERF` |
| 24 | `UPDATEFLAT` | `#info` | `5_Navigator Component Class.ls`: `sendupdateFlatInfo`, text | raw: `<flat id>/<name>/<door>/<show owner name>` | [Changing a room](#changing-a-room) |
| 25 | `SETFLATINFO` | `#info` | `5_Navigator Component Class.ls`: `sendupdateFlatInfo`, text; `hh_kiosk_room/4_RoomKiosk Component Class.ls`: `sendSetFlatInfo`, text | raw: `<flat id>/`, then lines `description=…`, `password=…` when one is set, `allsuperuser=…` and `maxvisitors=…` | [Changing a room](#changing-a-room) |
| 150 | `NAVIGATE` | `#info` | `5_Navigator Component Class.ls`: `sendNavigate`, typed | int node mask: 1 hides full rooms; int node id; int depth: 1 | Answered by 220. The info broker asks with mask 0 |
| 151 | `GETUSERFLATCATS` | `#info` | `5_Navigator Component Class.ls`: `sendGetUserFlatCats`, no body | none | On `#updateAvailableFlatCategories`, which the navigator executes when it first opens; answered by 221 |
| 152 | `GETFLATCAT` | `#info` | `5_Navigator Component Class.ls`: `sendGetFlatCategory`, typed | int flat id | Before the modify pages open, when the flat's category is unknown; answered by 222 |
| 153 | `SETFLATCAT` | `#info` | `5_Navigator Component Class.ls`: `sendSetFlatCategory`, typed; `hh_kiosk_room/4_RoomKiosk Component Class.ls`: `sendFlatCategory`, typed | int flat id; int category id | [Changing a room](#changing-a-room) |
| 154 | `GETSPACENODEUSERS` | `#info` | `5_Navigator Component Class.ls`: `sendGetSpaceNodeUsers`, typed | int node id | A click on a public room with Shift held; answered by 223 |
| 155 | `REMOVEALLRIGHTS` | `#info` | `5_Navigator Component Class.ls`: `sendRemoveAllRights`, typed | int flat id | From the modify pages, after a question |
| 156 | `GETPARENTCHAIN` | `#info` | `5_Navigator Component Class.ls`: `sendGetParentChain`, typed | int node id | After the login, for a default category that is not the root; answered by 227 |
| 264 | `GET_RECOMMENDED_ROOMS` | `#info` | `5_Navigator Component Class.ls`: `sendGetRecommendedRooms`, no body | none | After the login, and when the cached list is older than `navigator.recom.updatetime`; answered by 351 |

# Flows

## After the login

On `#userlogin` the navigator:

1. sends `NAVIGATE` for the default public category, the variable `navigator.public.default`, or else
   `navigator.visible.public.root`, after `GETPARENTCHAIN` when the two differ;
2. does the same for the default private category, `navigator.private.default` or `navigator.visible.private.root`;
3. sends `GET_RECOMMENDED_ROOMS`;
4. a second later, enters the room of the variables `forward.id` and `forward.type` (`1` for a public room) when both
   exist; or else sends `FOLLOW_FRIEND` with the variable `friend.id`, a command of `hh_friend_list`
   ([s1-11](/tasks/s1-11-friend-list.md)); or else opens the navigator.

## Browsing

- A category clicked sends `NAVIGATE` with its id, and 220 fills the list. `Hide full rooms` turns the node mask to 1.
- The own rooms tab sends `SUSERF`, the favourites tab `GETFVRF`, and the search button `SRCHF`.
- A room clicked shows its info from the cache; a click on its Go area, or on Go, enters it.
- The client keeps each answer for `navigator.cache.duration` seconds, or `navigator.updatetime` milliseconds, and
  asks again after that.

## Entering a room

1. A public room enters at once: the navigator executes `#enterRoom` with the room's data, which `hh_room` acts on
   ([s1-06](/tasks/s1-06-room.md)).
2. A flat needs its data first, asked with `GETFLATINFO` when the cache lacks it. The owner always enters; for anyone
   else, a door of `password` asks for the password first, and any other door goes on to enter through `hh_room`,
   whose window waits at the bell of a closed one.
3. The server may answer an entry with 224: 1 shows `nav_error_room_full`, 2 `nav_error_room_closed`, 3 the text
   `queue_set.<queue set>.alert`, and 4 `nav_room_banned`, after the client executes `#leaveRoom`.
4. A password ends with 130, on which the client does nothing more, or with 33 `incorrect flat password` or
   `Password required!`, which shows the view `nav_gr_passwordincorrect` and takes the client back to the entry view.

## Changing a room

The owner's Modify pages, for a flat of the own rooms:

1. ask `GETFLATCAT` first when the flat's category is unknown, and open once 222 comes;
2. on OK, send `UPDATEFLAT` and then `SETFLATINFO`, both as text, and `SETFLATCAT` when the flat has a category; the
   name loses its `/` characters and its lines after the first, and an empty name sends nothing; the name and the
   description go through `convertSpecialChars`;
3. offer `REMOVEALLRIGHTS` and, after three questions, `DELETEFLAT`, followed by `SUSERF`.

`SETFLATINFO`'s lines, after the first `<flat id>/`, are separated by line breaks (`RETURN`): `description=` the
description, `password=` the new password when one was typed, `allsuperuser=` whether others may move furniture,
and `maxvisitors=` the most visitors.

## Forwarding

286 executes `#roomForward` with the room id and `#public` or `#private`, which enters the room as above. A 286 that
comes sooner than `navigator.room.forward.timeout` milliseconds after the last one is ignored. Other casts enter
rooms the same way: the event browser, group info, the navigator popup and the new user tutorial.

# Notes

## Counts

`6_Navigator Handler Class.ls` registers 18 messages and 18 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says.

## Ids other casts register too

- 33: `hh_entry_init`, `hh_kiosk_room` and `hh_room` each compare the whole text with texts of their own
  ([hh_entry_init](/reference/r26/hh_entry_init.md#ids-other-casts-register-too)).
- `SETFLATINFO` and `SETFLATCAT` are also sent by `hh_kiosk_room`, which registers neither.

## Dead code

- `SBUSYF` is registered and never sent.
- 225 is read and its id never used.

## Quirks

- 16 and 55 are text, with tabs and lines, where every other answer of the cast is typed.
- `SUSERF` sends the user's own name, which the server already knows.
- 61 reads a node mask and a node header of its own before the nodes, and keeps only the flat list of a header of
  type 2.
- `ADD_FAVORITE_ROOM` and `DEL_FAVORITE_ROOM` send 1 for a public room and 0 for a flat, where nodes call a public
  room type 1 and a flat type 2.
- The door of a flat is a number in 54 and text in the lists.
- 351 stops after three rooms, logging "Server is providing too many … room recommendations", and leaves the rest of
  the body unread.
