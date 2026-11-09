---
type: Reference
title: R26 hh_room
description: How the R26 client enters a room, builds it from its height map, objects, items and users, keeps the users moving through status lines, and handles furniture, the hand, trading, teleports, rights, the doorbell, groups, tags, ratings, events and ignoring, from hh_room's .ls scripts.
timestamp: 2026-11-09T19:30:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:30:21+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_room/`. Below, scripts of this cast are named by their file name, and scripts of
other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Room Interface Class.ls` | The room's window and its clicks: walking, moving, placing and deleting furniture, trading, the queue banner |
| `4_Room Component Class.ls` | Entering, building and leaving a room, the chat, the room's objects and users |
| `5_Room Handler Class.ls` | Registers 72 messages and 73 commands, and parses the messages |
| `6_Spectator System Class.ls` | Spectator mode and the spectator count |
| `7_Room Geometry Class.ls` | The height map |
| `8_Room Hiliter Class.ls` | The tile under the cursor |

Every message and command is on `connection.room.id`, which is `#info`
([fuse_client](/reference/r26/fuse_client.md)). Many of the commands are sent by other casts:

| Script | Why it is here |
| --- | --- |
| `hh_furni_classes/…` | The furniture classes: walking to an object, its state, dice, drinks, teleports, post-its, presents |
| `hh_room_ui/3_Room Bar Class.ls`, `4_Room Info Class.ls`, `5_Room Object Displayer Class.ls` | The room bar, the room's info and rating, and the buttons on a selected user or object |
| `hh_room_utils/…` | The hand, the object mover, the safe trader, the doorbell, the badges, group info, the ignore list and the room event browser ([s1-07](/tasks/s1-07-room-utils.md)) |
| `hh_room_utils/25_Chat Manager.ls` | Also registers `CHAT`, `SHOUT` and `WHISPER`, and receives the chat ([s1-07](/tasks/s1-07-room-utils.md)) |
| `hh_buffer/4_Buffer Handler Class.ls` | Also listens to 84, 85, 88, 94 and 95, to hold them while a class downloads ([hh_buffer](/reference/r26/hh_buffer.md)) |
| `hh_human/2_Human Class EX.ls`, `hh_pets_common/1_Pet Class.ls` | The actions of [status](#status) lines |
| `hh_photo`, `hh_pets_common`, `hh_kiosk_room`, `hh_soundmachine`, `hh_navigator`, `hh_ig` | Send a few of the commands ([Commands from the client](#commands-from-the-client)) |

# Messages from the server

The table is ordered by topic: entering, the room's parts, users, rights, the hand, trading, teleports, groups,
rating, events and ignoring.

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| -1 | `handle_disconnect` | `#info` (room) | none | The connection dropped: the client leaves the room ([fuse_client](/reference/r26/fuse_client.md#closing-and-the--1-message)) |
| 18 | `handle_clc` | `#info` (room) | none read | The client leaves the room, as on -1 |
| 19 | `handle_opc_ok` | `#info` (room) | none read | In a private room the client goes on with `TRYFLAT` ([Entering a room](#entering-a-room)); elsewhere nothing |
| 41 | `handle_flat_letin` | `#info` (room) | string name | Empty: the user may come in, and the client sends `GOTOFLAT`. A name: the client tells the user that this user was let in |
| 69 | `handle_room_ready` | `#info` (room) | raw: the room's marker, the first word | The room's model: the client shows the room and asks for its parts |
| 91 | `handle_doorbell_ringing` | `#info` (room) | raw: a user's name, or empty | Empty: the user waits at the door. A name: the window that lets that user in |
| 131 | `handle_flatnotallowedtoenter` | `#info` (room) | string name | The doorbell's answer was no, shown with the name |
| 33 | `handle_error` | `#info` (room) | raw: the error's text | `info: No place for stuff` stops the object mover; `Incorrect flat password` and `Password required` go to the navigator; `weird error` leaves the room; `Not owner` takes `room_controller` away. Every text is logged |
| 258 | `handle_interstitialdata` | `#info` (room) | raw: `<image url>` `TAB` `<link url>`; a body of one character or less for none | The answer to `GETINTERST`: the ad shown while the room loads |
| 208 | `handle_roomad` | `#info` (room) | raw: `<image url>` `TAB` `<link url>`; a body of one character or less for none | The answer to `GETROOMAD`: the room's ad |
| 259 | `handle_roomqueuedata` | `#info` (room) | int set count; per set: string name, int target, int queue count, per queue a string queue id and an int length | The room's queue window. `ROOM_QUEUE_CHANGE` sends a set's target |
| 254 | `handle_youarespectator` | `#info` (room) | none | Spectator mode |
| 283 | `handle_removespecs` | `#info` (room) | none | The notice that spectators are removed |
| 298 | `handle_spectator_amount` | `#info` (room) | int count; int most | The answer to `GET_SPECTATOR_AMOUNT` |
| 71 | `handle_showprogram` | `#info` (room) | raw: `<destination> <command> <arguments>` | Handed to the room's own program, the class named after the marker, as `SHOWPROGRAM` |
| 31 | `handle_heightmap` | `#info` (room) | raw: the [height map](#the-height-map) | The answer to `G_HMAP` |
| 219 | `handle_heightmapupdate` | `#info` (room) | raw: changes to the height map | [The height map](#the-height-map) |
| 30 | `handle_OBJECTS` | `#info` (room) | raw: one line per object: `<id> <class> <x> <y> <height> <direction>`, or `<width> <height>` in place of the direction; lines of 5 characters or fewer are skipped | The answer to `G_OBJS`: the room's fixed objects |
| 32 | `handle_activeobjects` | `#info` (room) | int count; per object: an [active object](#an-active-object) | The room's furniture |
| 93 | `handle_activeobject_add` | `#info` (room) | an active object | |
| 94 | `handle_activeobject_remove` | `#info` (room) | raw: the object's id, the first word | |
| 95 | `handle_activeobject_update` | `#info` (room) | an active object | Redefines an object the room has, and ends its slide |
| 45 | `handle_items` | `#info` (room) | raw: one [wall item](#a-wall-item) per line | The answer to `G_ITEMS` |
| 83 | `handle_items` | `#info` (room) | raw: one wall item per line | Items added |
| 84 | `handle_removeitem` | `#info` (room) | raw: the item's id | Also stops the object mover |
| 85 | `handle_updateitem` | `#info` (room) | raw: the item's id, the first word, and its state, the last word | |
| 88 | `handle_stuffdataupdate` | `#info` (room) | string object id; string state | An object's state, as `SETSTUFFDATA` sets it |
| 46 | `handle_flatproperty` | `#info` (room) | raw: `<key>/<value>` | A room property, such as a wallpaper, a floor or a landscape |
| 48 | `handle_idata` | `#info` (room) | raw: `<item id>` `TAB` `<type>` on the first line, then the text | The answer to `G_IDATA`: executes `#itemdata_received<id>` with the id, the type and the text, for a post-it or a photo |
| 230 | `handle_slideobjectbundle` | `#info` (room) | int from x; int from y; int to x; int to y; int object count; per object: int id, string from height, string to height; int roller id; int move type: 0 none, 1 `mv`, 2 `sld`; for 1 or 2, int user index, string from height, string to height | A roller moving objects, and a user on it |
| 90 | `handle_dice_value` | `#info` (room) | raw: `<object id>`, or `<object id> <value>` | One word: the dice rolls. Two: the face is the value less 38 times the id, and a face above 6 is 0 |
| 129 | `handle_presentopen` | `#info` (room) | raw: three lines: type, code, colours | The answer to `PRESENTOPEN`, shown on the package card |
| 76 | `handle_no_user_for_gift` | `#info` (room) | raw: a user's name | `no_user_for_gift`, its `%user%` replaced by the name |
| 28 | `handle_users` | `#info` (room) | raw: [user lines](#a-user) | The answer to `G_USRS`, and users coming in. A body with no user says there is none |
| 29 | `handle_logout` | `#info` (room) | raw: the user's room index, the first word | The user leaves, unless it is the user themselves |
| 34 | `handle_status` | `#info` (room) | raw: [status lines](#status) | The answer to `G_STAT`, and every move |
| 266 | `handle_figure_change` | `#info` (room) | int user's room index; string figure; string sex; string custom | |
| 228 | `handle_userbadge` | `#info` (room) | string web id; int count; per badge: int slot, string badge | |
| 210 | `handle_petstat` | `#info` (room) | int pet's room index; int age; int hunger; int thirst; int happiness; int energy; int friendliness | The answer to `GETPETSTAT`. The last five pick the texts `pet_hung_<n>`, `pet_thir_<n>`, `pet_mood_<n>`, `pet_enrg_<n>` and `pet_frnd_<n>` |
| 361 | `handle_user_typing_status` | `#info` (room) | int user index; int state | |
| 362 | `handle_highlight_user` | `#info` (room) | string user index | The user to highlight once the user themselves is in the room |
| 350 | `handle_user_tag_list` | `#info` (room) | int user id; int count; per tag: string | The answer to `GET_USER_TAGS` |
| 42 | `handle_room_rights` | `#info` (room) | none | The user controls the room: `room_controller` on |
| 43 | `handle_room_rights` | `#info` (room) | none | `room_controller` off |
| 47 | `handle_room_rights` | `#info` (room) | none | The user owns the room: `room_owner` on |
| 70 | `handle_youaremod` | `#info` (room) | none read | Nothing |
| 140 | `handle_stripinfo` | `#info` (room) | raw: [the hand](#the-hand) | The answer to `GETSTRIP`: the hand shows these items |
| 98 | `handle_stripinfo` | `#info` (room) | raw: the hand, holding one item | The item is added to the hand |
| 99 | `handle_removestripitem` | `#info` (room) | raw: the item's strip id, the first word | |
| 101 | `handle_stripupdated` | `#info` (room) | none | The client sends `GETSTRIP new` |
| 108 | `handle_trade_items` | `#info` (room) | raw: two lines, one per user: `<name> <accepted> <items>`, the items written as in [the hand](#the-hand) | Opens or refreshes the trade. With a user the user ignores, the client sends `TRADE_CLOSE` |
| 109 | `handle_trade_accept` | `#info` (room) | raw: `<name>/<true or false>` | |
| 105 | `handle_trade_completed` | `#info` (room) | none | |
| 112 | `handle_trade_completed` | `#info` (room) | none | |
| 110 | `handle_trade_close` | `#info` (room) | none | The trade window closes, and the client sends `GETSTRIP new` |
| 102 | `handle_youarenotallowed` | `#info` (room) | none | `trade_youarenotallowed` |
| 103 | `handle_othernotallowed` | `#info` (room) | none | `trade_othernotallowed` |
| 62 | `handle_doorflat` | `#info` (room) | int target teleport id; int flat id | The answer to `GETDOORFLAT` ([Teleports](#teleports)); a 0 in either stops it |
| 63 | `handle_doordeleted` | `#info` (room) | none | The teleport the user stands in walks them out |
| 64 | `handle_doordeleted` | `#info` (room) | none | As 63 |
| 89 | `handle_door_out` | `#info` (room) | raw: the teleport's id | Animates it |
| 92 | `handle_door_in` | `#info` (room) | raw: `<teleport id>/<user name>` | Animates it; for the user themselves, walks them out once it ends |
| 309 | `handle_group_badges` | `#info` (room) | int count; per group: int id, string logo | The answer to `GET_GROUP_BADGES` |
| 310 | `handle_group_membership_update` | `#info` (room) | int user index; int group id; int status | |
| 311 | `handle_group_details` | `#info` (room) | int group id, -1 for none; then string name, string description, int room id, string room name | The answer to `GET_GROUP_DETAILS` |
| 345 | `handle_room_rating` | `#info` (room) | int rating; int percent | |
| 367 | `handle_roomevent_permission` | `#info` (room) | int may create | The answer to `CAN_CREATE_ROOMEVENT`: not 0 lets the user create one |
| 368 | `handle_roomevent_types` | `#info` (room) | int count | The answer to `GET_ROOMEVENT_TYPE_COUNT` |
| 369 | `handle_roomevent_list` | `#info` (room) | int type; int count; per event: string flat id, string host name, string name, string description, string time | The answer to `GET_ROOMEVENTS_BY_TYPE` |
| 370 | `handle_roomevent_info` | `#info` (room) | string host id; when above 0, string host name, string flat id, int type, string name, string description, string time | The room's event |
| 419 | `handle_ignore_user_result` | `#info` (room) | int result | Executes `#ignore_user_result` with it |
| 420 | `handle_ignore_list` | `#info` (room) | int count; per user: string name | The answer to `GET_IGNORE_LIST` |

## The height map

31's body is one line per row, one character per tile:

| Character | Tile |
| --- | --- |
| `x` | Blocked |
| `0` to `9` | That height; furniture may be placed |
| `A` to `H` | Heights 0 to 7; nothing may be placed |
| `y` | Height 0; nothing may be placed |

219 changes the height map the client holds: each character replaces the next one, from the start, and `!` followed
by a character skips as many as that character's code.

## An active object

In 32, 93 and 95: string id; string class; int x; int y; int width; int height; int direction, modulo 8; string
altitude, a number with a decimal part; string colours, empty read as `0`; string runtime data; int extra; string
stuff data. `hh_buffer` reads the same ([hh_buffer](/reference/r26/hh_buffer.md#an-active-object)).

## A wall item

One line of 45 or 83, its values `TAB`-separated: id; class; owner; location; type. The location has two forms:

- `:w=<x>,<y> l=<x>,<y> <r or l>`: the wall's coordinates, the place on it, and the right or left wall;
- `<wall> <y>,<height>,<z>`: an older form, `frontwall` read as `rightwall`.

## A user

28's lines are `<key>:<value>`, the key the first character and the value from the third. A line of `i` starts a
user, and the other lines belong to the last one:

| Key | Value |
| --- | --- |
| `i` | Room index, by which the other messages name the user |
| `n` | Name. A `chr(4)` in it makes the user a pet, whose name is what follows it |
| `f` | Figure |
| `l` | `<x> <y> <height>` |
| `c` | Custom text |
| `s` | Sex: `F` when it starts with `F` or `f`, else `M` |
| `p` | A swimmer's figure, when it holds `ch=s`: the model is its characters 4 to 6, and the colour its second `/` item, as `<r>,<g>,<b>` |
| `b` | Badges: `<slot>:<badge>`, comma-separated |
| `a` | Web id |
| `g` | Group id |
| `t` | Group status |
| `x` | Experience, an int |

A line starting with `[bot]` makes the user a bot. A user whose name is the user's own sets the session's
`user_index`.

## Status

34's lines are `/`-separated: first `<room index> <x>,<y>,<height>,<head direction>,<body direction>`, then actions,
`<name> <parameters>`. Lines of 5 characters or fewer are skipped, and so are actions of one character. For each
action the client calls `action_<name>` on the user, with the whole action, `mv`, `sit` and `lay` first:

| Action | Parameters | Class |
| --- | --- | --- |
| `mv` | `<x>,<y>,<height>`: the tile the user walks to | human, pet |
| `sld` | `<x>,<y>,<height>`, whether objects move along, and a start time: the action 230 makes for a roller | human, pet |
| `sit` | height, then whether the user queues | human, pet |
| `lay` | height | human, pet; a pet's `slp` too |
| `carryd`, `carryf`, `cri` | the object carried | human |
| `usei`, `drink`, `eat` | the object used | human |
| `dance` | the dance's number | human |
| `gest` | the gesture | human, pet (`gst`) |
| `flatctrl` | the control level | human |
| `mod` | a state | human |
| `sign` | the sign's number | human |
| `joingame` | game id, game type | human |
| `talk`, `wave`, `ohd`, `trd`, `sleep` | none | human |
| `snf`, `scr`, `bnd`, `jmp`, `ded`, `eat`, `beg`, `pla`, `rdy`, `talk`, `wav` | none | pet |

## The hand

140 and 98 carry the hand's items `/`-separated. An item's values are separated by `chr(30)`:

| Value | Meaning |
| --- | --- |
| 1 | Not read |
| 2 | Strip id |
| 3 | Position in the hand |
| 4 | `S` for furniture, `I` for a wall item |
| 5 | Id |
| 6 | Class |
| 7, 8 for `S` | Width, height |
| 9 for `S` | Stuff data |
| 10 for `S` | Colours; when they start with `#`, the last one colours the item in the hand |
| 11 for `S` | Recyclable |
| 12, 13 for `S` | Slot id and song id, when not empty |
| 7 for `I` | Its data: for a `poster`, the poster's number |
| 8 for `I` | Recyclable |

An empty element, or one with no `chr(30)`, ends the list. Of the latter, the value less one is taken as the hand's
total item count, which turns the next page button on. The body's last line is the count the hand shows. Names come from the texts `furni_<class>_name`, `poster_<n>_name` and
`wallitem_<class>_name`.

# Commands from the client

Registered by `5_Room Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, with text the
text is the body, and with a typed list it goes through `sendNew`
([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 2 | `#room_directory` | `#info` (room) | `4_Room Component Class.ls`: `enterRoomDirect` and `roomPrePartFinished`, typed | bool public: 0 a private room, 1 a public one; int room: a private room's flat id, a public room's port; int door: a public room's door, 0 for a private room | [Entering a room](#entering-a-room). Its name is a symbol |
| 28 | `GETDOORFLAT` | `#info` (room) | `hh_furni_classes/31_Furniture Teleport Class.ls`: `tryDoor`, text | raw: the teleport's id | Answered by 62 |
| 52 | `CHAT` | `#info` (room) | `4_Room Component Class.ls`: `sendChat`, typed | string text | `sendChat` names the command by the chat mode ([s1-07](/tasks/s1-07-room-utils.md)) |
| 53 | `QUIT` | `#info` (room) | `hh_ig/3_IG Handler Class.ls`: `handle_enter_arena`, no body; `hh_navigator/5_Navigator Component Class.ls`: `expandHistoryItem`, no body; `3_Room Interface Class.ls`: `eventProcBanner`, no body; `6_Spectator System Class.ls`: `setSpectatorMode`, no body | none | Leaves the room |
| 54 | `GOVIADOOR` | `#info` (room) | `4_Room Component Class.ls`: `enterDoor` and `roomConnected`, text | raw: `<flat id>/<target teleport id>` | Arriving through a teleport ([Teleports](#teleports)) |
| 55 | `SHOUT` | `#info` (room) | `4_Room Component Class.ls`: `sendChat`, typed | string text | As `CHAT` |
| 56 | `WHISPER` | `#info` (room) | `4_Room Component Class.ls`: `sendChat`, typed | string: a user's name, a space, the text | As `CHAT` |
| 57 | `TRYFLAT` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, text | raw: `<flat id>`, or `<flat id>/<password>` when the navigator holds one | On 19 in a private room |
| 59 | `GOTOFLAT` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, text | raw: the flat id | On 41 with no name |
| 60 | `G_HMAP` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, no body | none | Answered by 31; not sent while the client keeps the room's height map |
| 61 | `G_USRS` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, no body | none | Answered by 28 |
| 62 | `G_OBJS` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, no body | none | Answered by 30; not sent while the client keeps the room's objects |
| 63 | `G_ITEMS` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, no body | none | Answered by 45; private rooms only, and not while the client keeps them |
| 64 | `G_STAT` | `#info` (room) | `4_Room Component Class.ls`: `updateProcess`, no body | none | Once the room is built; answered by 34 |
| 65 | `GETSTRIP` | `#info` (room) | `3_Room Interface Class.ls`: `placeFurniture`, text; `5_Room Handler Class.ls`: `handle_stripupdated` and `handle_trade_close`, text; `hh_room_utils/17_Object Mover Class.ls`: `define` and `cancelMove`, text; `hh_room_utils/18_Container Hand Class.ls`: `open`, `appendStripItem`, `eventProcContainer` and `eventProcHandButtons`, text | raw: `new`, `update`, `next` or `prev` | Answered by 140 |
| 66 | `FLATPROPBYITEM` | `#info` (room) | `hh_room_utils/18_Container Hand Class.ls`: `placeItemToRoom`, text | raw: `<class>/<strip id>` | A wallpaper, floor or landscape from the hand |
| 67 | `ADDSTRIPITEM` | `#info` (room) | `hh_furni_classes/5_Item Object Class.ls`: `updateLocation`, text; `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, text; `hh_room_utils/18_Container Hand Class.ls`: `eventProcContainer`, text | raw: `new stuff <id>` or `new item <id>` | Picks furniture or a wall item up into the hand |
| 68 | `TRADE_UNACCEPT` | `#info` (room) | `hh_room_utils/3_Safe Trader Class.ls`: `eventProcTrading`, no body | none | |
| 69 | `TRADE_ACCEPT` | `#info` (room) | `hh_room_utils/3_Safe Trader Class.ls`: `eventProcTrading` and `eventProcTradingConfirmation`, no body | none | |
| 70 | `TRADE_CLOSE` | `#info` (room) | `5_Room Handler Class.ls`: `handle_trade_items`, no body; `hh_room_utils/3_Safe Trader Class.ls`: `eventProcTrading`, no body | none | |
| 71 | `TRADE_OPEN` | `#info` (room) | `3_Room Interface Class.ls`: `startTrading`, text | raw: the other user's room index | [Trading](#trading) |
| 72 | `TRADE_ADDITEM` | `#info` (room) | `hh_room_utils/3_Safe Trader Class.ls`: `eventProcTrading`, text | raw: the strip id of an item in the hand | |
| 73 | `MOVESTUFF` | `#info` (room) | `hh_furni_classes/3_Active Object Class.ls`: `rotate`, text; `3_Room Interface Class.ls`: `eventProcRoom`, text | raw: `<id> <x> <y> <direction>` | Moving or turning furniture |
| 74 | `SETSTUFFDATA` | `#info` (room) | `hh_furni_classes/6_Active Object Extension Class.ls`: `getNextState`, typed; `hh_furni_classes/23_Pet Toy Class.ls`: `update`, typed; `hh_furni_classes/26_Furniture Holo Class.ls`: `select`, typed; `hh_furni_classes/27_Furniture Fridge Class.ls`: `giveDrink`, typed; `hh_furni_classes/28_Furniture Toilet Class.ls`: `select`, typed; `hh_furni_classes/29_Furniture Sink Class.ls`: `giveDrink`, typed; `hh_furni_classes/30_Furniture Luxus TV Class.ls`: `select`, typed; `hh_furni_classes/31_Furniture Teleport Class.ls`: `select`, `kickOut` and `update`, typed; `hh_furni_classes/32_Furniture Divider Class.ls`: `select`, typed; `hh_furni_classes/35_Furniture Score Class.ls`: `select`, typed; `hh_furni_classes/36_Furniture Hockeylight Class.ls`: `select`, typed; `hh_furni_classes/41_Furniture Waterbowl Class.ls`: `select`, typed; `hh_furni_classes/42_Furniture IcecreamMachine Class.ls`: `setAnimation`, typed; `hh_furni_classes/45_Furniture Scifirocket Class.ls`: `select`, typed; `hh_furni_classes/46_Furniture Scifidoor Class.ls`: `select`, typed; `hh_furni_classes/47_Furniture Scifiport Class.ls`: `select`, typed; `hh_furni_classes/48_Furniture Club TV Class.ls`: `setOn` and `setOff`, typed; `hh_furni_classes/49_Furniture Traffic Light Class.ls`: `select`, typed; `hh_furni_classes/50_Furniture Barrier Class.ls`: `select`, typed; `hh_furni_classes/51_Furniture StudyDesk Class.ls`: `select`, typed; `hh_furni_classes/52_Furniture Solarium Class.ls`: `select`, typed; `hh_furni_classes/54_Furniture Red TV Class.ls`: `setOn` and `setOff`, typed; `hh_furni_classes/56_Birdie Class.ls`: `select`, typed; `hh_soundmachine/15_Furniture Sound Machine Class.ls`: `changeState`, typed | string object id; string state | The object's new state, such as `TRUE`, `FALSE`, `ON`, `OFF`, `I` or a number |
| 75 | `MOVE` | `#info` (room) | `hh_furni_classes/6_Active Object Extension Class.ls`: `select`, typed; `hh_furni_classes/27_Furniture Fridge Class.ls`: `select`, typed; `hh_furni_classes/28_Furniture Toilet Class.ls`: `select`, typed; `hh_furni_classes/29_Furniture Sink Class.ls`: `select`, typed; `hh_furni_classes/31_Furniture Teleport Class.ls`: `select` and `kickOut`, typed; `hh_furni_classes/33_Furniture Samovar Class.ls`: `select`, typed; `hh_furni_classes/34_Furniture Edicehc Class.ls`: `select`, typed; `hh_furni_classes/39_Watermatic Class.ls`: `select`, typed; `hh_furni_classes/42_Furniture IcecreamMachine Class.ls`: `select`, typed; `hh_furni_classes/46_Furniture Scifidoor Class.ls`: `select`, typed; `hh_furni_classes/55_E-Dice Class.ls`: `select`, typed; `hh_furni_classes/59_Furniture OneWayDoor Class.ls`: `select`, typed; `hh_furni_classes/66_Fortune Class.ls`: `select`, typed; `hh_kiosk_room/39_Roommatic Class.ls`: `select`, typed; `3_Room Interface Class.ls`: `eventProcRoom`, typed; `hh_soundmachine/4_SoundMachine Component Class.ls`: `roomActivityUpdate`, typed | short x; short y | Walking. The sound machine's editor sends 1000, 1000 ([Quirks](#quirks)) |
| 76 | `THROW_DICE` | `#info` (room) | `hh_furni_classes/34_Furniture Edicehc Class.ls`: `select`, text; `hh_furni_classes/53_Furniture Bottle Class.ls`: `select`, text; `hh_furni_classes/55_E-Dice Class.ls`: `select`, text | raw: the dice's id | Answered by 90 |
| 77 | `DICE_OFF` | `#info` (room) | `hh_furni_classes/34_Furniture Edicehc Class.ls`: `select`, text; `hh_furni_classes/55_E-Dice Class.ls`: `select`, text | raw: the dice's id | Answered by 90 |
| 78 | `PRESENTOPEN` | `#info` (room) | `hh_furni_classes/58_Package Card Class.ls`: `openPresent`, text | raw: the present's id | Answered by 129 |
| 79 | `LOOKTO` | `#info` (room) | `hh_furni_classes/27_Furniture Fridge Class.ls`: `giveDrink`, text; `hh_furni_classes/29_Furniture Sink Class.ls`: `giveDrink`, text; `hh_furni_classes/33_Furniture Samovar Class.ls`: `giveDrink`, text; `hh_furni_classes/39_Watermatic Class.ls`: `giveDrink`, text; `hh_furni_classes/42_Furniture IcecreamMachine Class.ls`: `setAnimation`, text; `hh_kiosk_room/39_Roommatic Class.ls`: `useRoomKiosk`, text; `3_Room Interface Class.ls`: `eventProcUserObj`, text | raw: `<x> <y>` | Turns the user to a tile |
| 80 | `CARRYDRINK` | `#info` (room) | `hh_furni_classes/27_Furniture Fridge Class.ls`: `giveDrink`, text; `hh_furni_classes/29_Furniture Sink Class.ls`: `giveDrink`, text; `hh_furni_classes/33_Furniture Samovar Class.ls`: `giveDrink`, text; `hh_furni_classes/39_Watermatic Class.ls`: `giveDrink`, text; `hh_furni_classes/42_Furniture IcecreamMachine Class.ls`: `giveDrink`, text | raw: a drink's token, one of the furniture's at random | |
| 81 | `INTODOOR` | `#info` (room) | `hh_furni_classes/31_Furniture Teleport Class.ls`: `select`, text | raw: the teleport's id | |
| 82 | `DOORGOIN` | `#info` (room) | `hh_furni_classes/31_Furniture Teleport Class.ls`: `startTeleport`, text | raw: the teleport's id | |
| 83 | `G_IDATA` | `#info` (room) | `hh_furni_classes/22_PostIt Manager Class.ls`: `open`, text; `hh_photo/3_Photo Component Class.ls`: `openPhoto`, text | raw: the item's id | Answered by 48 |
| 84 | `SETITEMDATA` | `#info` (room) | `hh_furni_classes/22_PostIt Manager Class.ls`: `close`, text | raw: `<item id>/<colour> <text>`, the colour six hexadecimal digits | A post-it written |
| 85 | `REMOVEITEM` | `#info` (room) | `hh_furni_classes/22_PostIt Manager Class.ls`: `delete`, text; `hh_photo/3_Photo Component Class.ls`: `eventProcPhotoMouseDown`, text; `3_Room Interface Class.ls`: `eventProcDelConfirm`, text | raw: the item's id | |
| 87 | `CARRYITEM` | `#info` (room) | `hh_photo/2_Photo Interface Class.ls`: `open`, text | raw: `20` | The camera taken out |
| 88 | `STOP` | `#info` (room) | `hh_photo/2_Photo Interface Class.ls`: `close`, text; `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, text | raw: `CarryItem` or `Dance` | |
| 89 | `USEITEM` | `#info` (room) | `hh_photo/2_Photo Interface Class.ls`: `eventProcCameraMouseDown`, text | raw: `20`, `TAB`, `1500` | A photo taken |
| 90 | `PLACESTUFF` | `#info` (room) | `3_Room Interface Class.ls`: `placeFurniture`, text | raw: `<strip id> <x> <y> <direction>` for furniture; `<strip id> :w=<x>,<y> l=<x>,<y> <r or l>` for a wall item | Placing from the hand |
| 93 | `DANCE` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, no body; `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, typed | none, or int dance 1 to 4 | |
| 94 | `WAVE` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, no body | none | |
| 95 | `KICKUSER` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, text | raw: the user's name | |
| 96 | `ASSIGNRIGHTS` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, text | raw: the user's name | |
| 97 | `REMOVERIGHTS` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, text | raw: the user's name | |
| 98 | `LETUSERIN` | `#info` (room) | `hh_room_utils/19_Doorbell Class.ls`: `eventProcDoorBell`, typed | string name; bool let in | The doorbell's window |
| 99 | `REMOVESTUFF` | `#info` (room) | `3_Room Interface Class.ls`: `eventProcDelConfirm`, text | raw: the furniture's id | After a confirmation |
| 115 | `GOAWAY` | `#info` (room) | no script | — | Registered only |
| 126 | `GETROOMAD` | `#info` (room) | `4_Room Component Class.ls`: `roomConnected`, no body | none | On 69; answered by 208 |
| 128 | `GETPETSTAT` | `#info` (room) | `hh_pets_common/1_Pet Class.ls`: `select`, typed | string: the pet's name as 28 gave it, `chr(4)` included | Answered by 210 |
| 158 | `SETBADGE` | `#info` (room) | `hh_room_utils/16_Badge Manager Class.ls`: `sendSetBadges`, typed | 5 times: int slot 1 to 5, string badge, empty for none | |
| 182 | `GETINTERST` | `#info` (room) | `4_Room Component Class.ls`: `enterRoom`, text | raw: `general` | Answered by 258 |
| 183 | `CONVERT_FURNI_TO_CREDITS` | `#info` (room) | `hh_furni_classes/24_Credit Redeem Confirmation Class.ls`: `sendCreditRedeem`, typed | int furniture id | |
| 211 | `ROOM_QUEUE_CHANGE` | `#info` (room) | `3_Room Interface Class.ls`: `eventProcBanner`, typed | int target, one of 259's | |
| 214 | `SETITEMSTATE` | `#info` (room) | `hh_furni_classes/7_Item Object Extension Class.ls`: `getNextState`, typed | string item id; int new state | |
| 216 | `GET_SPECTATOR_AMOUNT` | `#info` (room) | `6_Spectator System Class.ls`: `getSpectatorCount`, no body | none | Answered by 298 |
| 230 | `GET_GROUP_BADGES` | `#info` (room) | `hh_room_utils/11_Group Info Class.ls`: `requestGroups`, no body | none | Answered by 309 |
| 231 | `GET_GROUP_DETAILS` | `#info` (room) | `hh_room_utils/11_Group Info Class.ls`: `showUsersInfo`, typed | int group id | Answered by 311 |
| 247 | `SPIN_WHEEL_OF_FORTUNE` | `#info` (room) | `hh_furni_classes/10_Habbo Wheel Class.ls`: `select`, typed | int furniture id | |
| 261 | `RATEFLAT` | `#info` (room) | `hh_room_ui/4_Room Info Class.ls`: `sendFlatRate`, typed | int 1 or -1 | |
| 263 | `GET_USER_TAGS` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `updateUserTags`, typed | int user id | Answered by 350 |
| 314 | `SET_RANDOM_STATE` | `#info` (room) | `hh_furni_classes/65_Valentine Randomizer Class.ls`: `select`, typed; `hh_furni_classes/66_Fortune Class.ls`: `select`, typed | int furniture id | |
| 317 | `USER_START_TYPING` | `#info` (room) | `hh_room_ui/3_Room Bar Class.ls`: `sendTypingState`, no body | none | |
| 318 | `USER_CANCEL_TYPING` | `#info` (room) | `hh_room_ui/3_Room Bar Class.ls`: `sendTypingState`, no body | none | |
| 319 | `IGNOREUSER` | `#info` (room) | `hh_room_utils/20_Ignore List Class.ls`: `setIgnoreStatus`, typed | string name | Answered by 419 |
| 320 | `BANUSER` | `#info` (room) | `hh_room_ui/5_Room Object Displayer Class.ls`: `eventProc`, text | raw: the user's name | |
| 321 | `GET_IGNORE_LIST` | `#info` (room) | `hh_room_utils/20_Ignore List Class.ls`: `initIgnoreList`, no body | none | Answered by 420 |
| 322 | `UNIGNORE_USER` | `#info` (room) | `hh_room_utils/20_Ignore List Class.ls`: `setIgnoreStatus`, typed | string name | Answered by 419 |
| 345 | `CAN_CREATE_ROOMEVENT` | `#info` (room) | `hh_room_utils/32_RoomEvent Browser Class.ls`: `askCreatePermission`, no body | none | Answered by 367 |
| 346 | `CREATE_ROOMEVENT` | `#info` (room) | `hh_room_utils/32_RoomEvent Browser Class.ls`: `createEvent`, typed | int type; string name; string description | Name and description of 3 characters or more |
| 347 | `QUIT_ROOMEVENT` | `#info` (room) | `hh_room_ui/4_Room Info Class.ls`: `quitEvent`, no body | none | |
| 348 | `EDIT_ROOMEVENT` | `#info` (room) | `hh_room_utils/32_RoomEvent Browser Class.ls`: `createEvent`, typed | int type; string name; string description | As `CREATE_ROOMEVENT` |
| 349 | `GET_ROOMEVENT_TYPE_COUNT` | `#info` (room) | `4_Room Component Class.ls`: `getRoomEventTypeCount`, no body | none | Once; answered by 368 |
| 350 | `GET_ROOMEVENTS_BY_TYPE` | `#info` (room) | `4_Room Component Class.ls`: `getRoomEventList`, typed | int type | Answered by 369 |

# Flows

## Entering a room

1. `enterRoom` sends `GETINTERST general`, and 258's ad shows while the room's casts load.
2. When both are done, the client sends `#room_directory`: 0 with a private room's flat id, or 1 with a public room's
   port and door.
3. A private room goes on with 19. The client sends `TRYFLAT` with the flat id and the password the navigator holds.
   41 with no name lets the user in, and the client sends `GOTOFLAT`. 91 with no name makes the user wait at the door,
   and 131 turns them away; 33 `Incorrect flat password` and `Password required` go to the navigator.
4. 69 brings the room's marker, the model. The client shows the room, sends `GETROOMAD`, and asks for the parts it
   does not keep yet: `G_HMAP`, `G_USRS`, `G_OBJS` and, in a private room, `G_ITEMS`.
5. The room is built once it has the height map (31), the users (28), the objects (30), the furniture (32) and, in a
   private room, the items (45). No command asks for 32. The client then executes `#roomReady` and sends `G_STAT`,
   answered by 34.

While a user waits at the door, the room's controllers get 91 with that user's name, and answer with `LETUSERIN`.
`QUIT` leaves a room.

## Teleports

1. A double click on a teleport from the tile in front of it sends `SETSTUFFDATA` `TRUE`, `INTODOOR` and
   `GETDOORFLAT`; standing on it, `GETDOORFLAT` only. From elsewhere the user walks to the tile in front with `MOVE`.
2. 62 brings the target teleport and its flat. The client asks the navigator for the flat's data
   (`#requestRoomData`), then sends `DOORGOIN`.
3. When the teleport's animation ends, the same flat gets `GOVIADOOR` `<flat id>/<target teleport id>` at once. Another
   flat is entered from step 2 of [Entering a room](#entering-a-room), and on 19 the client sends `GOVIADOOR` in place
   of `TRYFLAT`.
4. 92 with the user's name animates the target teleport, which then sends `SETSTUFFDATA` `TRUE` and walks the user to
   the tile in front with `MOVE`. 63 and 64 do the same from the teleport the user is in.

## Trading

`TRADE_OPEN` with a user's room index opens the trade, which 108 fills. `TRADE_ADDITEM` adds an item from the hand,
after `TRADE_UNACCEPT` when the user had accepted. `TRADE_ACCEPT` and `TRADE_UNACCEPT` change the user's side, and 109
tells either side's state. 105 or 112 completes it; `TRADE_CLOSE` or 110 ends it, and the client asks for the hand
again with `GETSTRIP new`. 102 and 103 refuse it.

## The hand

`GETSTRIP` opens the hand (`new`), refreshes it (`update`), or turns its pages (`next`, `prev`), answered by 140. 98
adds one item, 99 removes one, and 101 makes the client ask again. Furniture is placed with `PLACESTUFF`, a wallpaper,
a floor or a landscape with `FLATPROPBYITEM`, and picked up with `ADDSTRIPITEM`.

# Notes

## Counts

`5_Room Handler Class.ls` registers 72 messages and 73 commands. [Registering scripts](/reference/client-r26.md#registering-scripts)
counts 71 and 72: it leaves out the message -1 and the command `#room_directory`, whose name is a symbol.

## Ids other casts register too

- -1: `hh_entry_init`'s `handleDisconnect` also runs ([hh_entry_init](/reference/r26/hh_entry_init.md#a-lost-connection)).
- 33: `hh_entry_init`, `hh_navigator` and `hh_kiosk_room` also listen, each comparing the whole text with texts of
  their own ([hh_entry_init](/reference/r26/hh_entry_init.md#ids-other-casts-register-too)).
- 84, 85, 88, 94 and 95: `hh_buffer` also listens, to hold them while a class downloads.
- `CHAT` (52), `SHOUT` (55) and `WHISPER` (56): `hh_room_utils/25_Chat Manager.ls` registers them too, with the same
  ids.

## Dead code

- `GOAWAY` (115) is registered, and no script sends it.
- `enterRoomDirect`, which sends `#room_directory` at once, is called by no script.
- 70 is read and ignored.
- `ADCLICK`, which `3_Room Interface Class.ls`'s `eventProcBanner` sends with the session's `ad_id` when the room's
  banner is clicked, is registered by no cast, so it never reaches the server
  ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

## Quirks

- While the sound machine's song editor is open, it sends `MOVE` 1000, 1000 every 30 seconds, a tile no room has.
- 30's line with a width and a height adds `#width` and `#height` to x and y, which the handler never set: it reads
  them into local variables.
- `startTrading` refuses a trade with the user's own name, but is given a room index, so the check never matches.
- 90 hides the dice's face: the second word is the face plus 38 times the dice's id.
- `GOVIADOOR`'s first value is the flat id, kept in a variable named `pTrgDoorID`.
