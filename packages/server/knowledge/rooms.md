---
type: Reference
title: Rooms
description: The hh_room commands the server answers: entering, furni, trading, chat, rights, events, queues, walking and rollers.
tags: [server]
---

`room.go` serves hh_room once the habbo is logged in
([hh_room](/r26/hh_room.md)). A room is entered as the client
does it: the ad while it loads, the door, the room's parts, then the habbo
comes in once its client has built the room, at `G_STAT`, as Holo had it.

| Command | Answer |
| --- | --- |
| `GETINTERST` (182) | 258: `game.loadingAdImage`, a tab and `game.loadingAdLink`, or `0`, which shows no ad (`knowledge/decisions/server/0070-a-loading-ad-and-a-room-ad-from-settings.md`) |
| `#room_directory` (2) | 19, for both kinds, as Holo sent it. The habbo leaves the room it is in or rings. A public room, named by its id, then gets 69, `<model> <id>`, or joins its queue when it is full. A habbo room goes on with `TRYFLAT` |
| `GOVIADOOR` (54) | `<flat id>/<teleport id>`, through the passage `GETDOORFLAT` opened. In the room the habbo is in, it stands in the other teleport at once: the room gets its status and 92, `<teleport id>/<name>`. Into another room, which it chose with `#room_directory`, 41 with an empty name lets it in past the doorbell, the password, a ban and a full room (`knowledge/decisions/server/0110-a-teleport-skips-every-check-of-the-door.md`); it goes on with `GOTOFLAT`, arrives in the teleport, and the others get 92 |
| `TRYFLAT` (57) | 41 with an empty name lets the habbo in. A full room queues it. The owner and the holders of `fuse_enter_locked_rooms` pass any door and any ban; anyone else banned gets 224 with 4; a password door compares `<id>/<password>` with the room's hash (`knowledge/decisions/server/0062-room-passwords-are-hashed.md`), or 33 `Incorrect flat password`; a closed door gets 91 and rings the doorbell of the habbos with rights in the room, who get 91 with the ringer's name. A room that is not loaded, or holds nobody who may answer, gets 131 at once, as Holo did with nobody in |
| `LETUSERIN` (98) | From a habbo with rights in the room: the ringer gets 41 and goes on with `GOTOFLAT`, or 131; the habbos with rights get 41 or 131 with its name, which their doorbells drop. A ringer who leaves is dropped the same way |
| `GOTOFLAT` (59) | 69, `model_<model> <id>`; then 46 for each of the room's landscape, wallpaper and floor that was set, `<property>/<pattern>`; then 47 for the owner and 42 for a habbo with rights; then the room's rating, 345, and its event, 370, as Holo sent them. The holders of `fuse_any_room_controller` count as owners, as Holo had it. Only after the door let the habbo through |
| `GETROOMAD` (126) | 208: `game.roomAdImage`, a tab and `game.roomAdLink`, or `0` |
| `G_HMAP` (60) | 31: the model's height map, a row per line |
| `G_USRS` (61) | 28: the user lines of the habbos in the room |
| `G_OBJS` (62) | 30: the model's public furni, `<id> <class> <x> <y> <height> <direction>` a line, then 32 with the floor furni that stands in the room, which no command asks for and the client needs |
| `G_ITEMS` (63) | 45: the wall items that stand in the room, a line each |
| `FLATPROPBYITEM` (66) | 46 to the room, `<property>/<pattern>`: the wallpaper, the floor or the landscape of the habbo's hand, `<class>/<strip id>`, is used up on the room, which keeps the pattern the furni was bought with. A habbo that controls the room decorates it, as Holo let it |
| `PLACESTUFF` (90) | Nothing to the sender alone: the furni of its hand stands in the room, and everyone in it gets 93 for a floor furni, `<strip id> <x> <y> <direction>`, or 83 for a wall item, `<strip id> :w=<x>,<y> l=<x>,<y> <r or l>`. A furni that may not stand there stays in the hand. A pad of post-its stays in the hand too: one note leaves it for the wall as a new, yellow wall item, the pad counts one fewer and goes with its last, and the sender gets 101 |
| `TRADE_OPEN` (71) | 108 to both: a trade opens with the habbo whose room index is the body, in any room (`knowledge/decisions/server/0112-habbos-trade-in-any-room.md`), and both show the status `trd`. A habbo trades with one habbo at a time. 102 when the sender holds no `fuse_trade`, 103 when the other holds none |
| `TRADE_ADDITEM` (72) | 108 to both, a line a side, the receiver's own first: `<name>` TAB `<true or false>` TAB the furni on offer, written as in the hand. A tradeable furni of the hand is offered once, up to `game.maxTradeFurni`, 65, a side; it takes both accepts away, and stays in the hand, where it is not placed or used up until the trade ends (`knowledge/decisions/server/0114-a-furni-on-offer-is-locked.md`) |
| `TRADE_ACCEPT` (69) | 109 to both, `<name>/true`. When both have accepted, every furni on offer changes hands in one transaction and both get 110; a furni that left its hand meanwhile undoes it all |
| `TRADE_UNACCEPT` (68) | 109 to both for each side that had accepted, `<name>/false`: both accepts go, as in Holo |
| `TRADE_CLOSE` (70) | 110 to both: the trade ends and nothing changes hands. Leaving the room or losing the connection does the same for the other habbo |
| `MOVESTUFF` (73) | 95 to the room: the floor furni stands on the new tile or turned. A furni that may not stand there stays, and its mover alone gets 95 with it where it is |
| `SETSTUFFDATA` (74) | 88 to the room, the furni's id and its new state: anyone in the room sets a floor furni's state, a lamp `ON`. Only a habbo that controls the room opens and closes a door furni, `O` and `C`, and a door closes only while nobody stands in it. A state longer than 32 characters is refused |
| `GETDOORFLAT` (28) | 62, the other teleport's id and its room's, for a habbo that stands in the teleport named by its id as text. Nothing while the other of the pair stands in no room (`knowledge/decisions/server/0111-a-teleport-keeps-its-partner.md`) |
| `INTODOOR` (81) | The habbo steps into the teleport from the tile in front of it, the one the teleport faces: its status goes to the room at once, with `mv`. A teleport's tile takes no walk otherwise |
| `DOORGOIN` (82) | 89 to the room, the id of the teleport the habbo stands in |
| `G_IDATA` (83) | 48, `<id>` TAB `<colour> <text>`: what is written on a post-it of the room, for anyone in it |
| `SETITEMDATA` (84) | 85 to the room, the post-it's line with its colour: a habbo that controls the room writes `<id>/<colour> <text>`. A `post.it` takes the four colours of the client's window; a text longer than `game.postItMaxLength`, 684, is refused (`knowledge/decisions/server/0108-rights-write-notes-owner-and-staff-delete.md`, `0109-post-it-length-is-a-setting.md`) |
| `REMOVEITEM` (85) | 84 to the room: the room's owner, or a holder of `fuse_remove_stickies`, deletes a post-it for good. Nothing else is deleted this way, and a post-it is never picked up |
| `SETITEMSTATE` (214) | 85 to the room, the wall item's line with its new state |
| `THROW_DICE` (76), `DICE_OFF` (77) | 90 to the room: the dice's id while it rolls, then two seconds later the id and its face, 1 to 6, plus 38 times the id; `DICE_OFF` shows no face. The habbo stands on a tile beside the dice. A bottle spins the same way and points one of eight ways |
| `CONVERT_FURNI_TO_CREDITS` (183) | 94 to the room and 6, the new balance, to the sender: the room's owner turns a credit furni that stands in the room, named by its id as a number, back into credits (`knowledge/decisions/server/0115-the-rooms-owner-redeems-credit-furni.md`). The furni is destroyed, the wallet of the habbo's user gets its worth, the number in its sprite, 50 for `CF_50_goldbar`, and the credit history the line `Furni exchanged (<item>)` under the reason `exchange`, in one transaction. Any other furni is left alone |
| `SPIN_WHEEL_OF_FORTUNE` (247) | 85 to the room: the wheel's line with -1 while it spins, and with its number, 0 to 9, 4.25 seconds later; for a habbo that controls the room |
| `SET_RANDOM_STATE` (314) | 88 to the room: the love randomizer's state `123456789` while it runs, and its number, 1 to 4, five seconds later |
| `CARRYDRINK` (80) | Nothing but the habbo's status: `carryd` and the drink's token, 1 to 26, for 9 seconds, then `drink` for 1, ten times over, as Holo's habbos sipped; never while it lies. A dance or `STOP CarryItem` takes the drink away |
| `PRESENTOPEN` (78) | 94 to the room, then 129 and 140 to the opener: the box that stands in the opener's own room goes, what waited in it lands in the opener's hand, 129 shows the last of it on the box's card, the class, the class with a wall item's data, and the colours, and the hand comes at its last page. Only the room's owner opens a box (`knowledge/decisions/server/0105-only-a-rooms-owner-opens-a-present.md`) |
| `ADDSTRIPITEM` (67) | 94 or 84 to the room, and 140 to the picker: the furni leaves the room for the picker's hand, `new stuff <id>` a floor furni and `new item <id>` a wall item |
| `G_STAT` (64) | The habbo comes in at the model's door: 34 with the others' statuses, then 28 with its own user lines and 34 with its status, which the others get too. In a habbo room the owner's status holds `flatctrl useradmin` and a habbo with rights `flatctrl` with no level, which the client's Human class reads as `furniture`; Holo's `onlyfurniture` was another client's. A room that filled meanwhile queues the habbo. A spectator gets the statuses alone and comes into no place |
| `QUIT` (53) | Nothing: the habbo leaves, and the others get 29 with its index |
| `ROOM_QUEUE_CHANGE` (211) | The habbo waiting in a full room's line moves to the line its target names, 1 the room's and 2 the spectators', at its end (`knowledge/decisions/server/0089-up-to-50-spectators-from-the-queue.md`) |
| `GET_SPECTATOR_AMOUNT` (216) | 298: how many watch the habbo's room and `game.maxSpectators`, or -1 for a habbo that watches none, which hides the client's count |
| `MOVE` (75) | Nothing at once: the habbo walks to the tile, two B64 shorts, a step on each tick of the room's clock. A tile off the floor, such as the 1000, 1000 of the sound machine's editor, changes nothing |
| `LOOKTO` (79) | The habbo turns, head and body, to the tile `<x> <y>`, unless it sits or lies, as Holo had it; its status goes out on the next tick |
| `CHAT` (52), in `room_utils.go` | 24 with the speaker's index and the text to the habbos within `game.chatRange` tiles each way, 5, as Holo had it; the farther ones get 24 with no text, which the client draws as its unheard bubble (`knowledge/decisions/server/0074-near-habbos-read-chat-far-ones-see-a-bubble.md`) |
| `SHOUT` (55), in `room_utils.go` | 26 to everyone in the room |
| `WHISPER` (56), in `room_utils.go` | `<name> <text>`: 25 to the named habbo and the speaker only, and to nobody when the name is not in the room, as Holo had it |
| `USER_START_TYPING` (317), `USER_CANCEL_TYPING` (318) | 361 to the room: the habbo's index and 1 or 0. A line ends the typing, and the room gets 361 with 0 first, as Holo sent it |
| `DANCE` (93) | With no body the normal dance, `dance`; with 1 to 4 a club dance, `dance <n>`, for the holders of `fuse_use_club_dance`; never while sitting or lying |
| `WAVE` (94) | `wave` for 1.5 s, which stops a dance (`knowledge/decisions/server/0075-talking-smileys-and-waves-as-holo.md`) |
| `STOP` (88) | `Dance` ends the dance; carrying waits for drinks |
| `IGNOREUSER` (319), `UNIGNORE_USER` (322) | 419: 0 failed (no such habbo, or the habbo itself), 1 added, 2 added with the oldest dropped past `game.maxIgnoredHabbos`, 100, or 3 removed (`knowledge/decisions/server/0076-ignore-up-to-100-the-oldest-dropped.md`) |
| `GET_IGNORE_LIST` (321) | 420: the names the habbo ignores, oldest first |
| `ASSIGNRIGHTS` (96), `REMOVERIGHTS` (97) | From the room's owner, or a holder of `fuse_any_room_controller`, about a habbo in the room, as the client shows the buttons: saved, then the habbo gets 42 or 43, and its status gains or loses `flatctrl` |
| `KICKUSER` (95) | From an owner or a habbo with rights, as the client shows the button: the habbo, never an owner or a holder of `fuse_any_room_controller`, walks to the door, a step every 500 ms and no longer where it wants, and leaves there with 18; it leaves at once when it cannot reach the door, which a habbo standing on it blocks (`knowledge/decisions/server/0079-a-kicked-habbo-walks-out.md`) |
| `BANUSER` (320) | From an owner only, as the client shows the button: the habbo is banned for `game.roomBanMinutes`, 15 (`knowledge/decisions/server/0067-a-room-ban-lasts-15-minutes.md`), saved and in the room's copy, and walks out as on `KICKUSER`; its next `TRYFLAT` gets 224 with 4 |
| `RATEFLAT` (261) | A vote, 1 or -1, once, in a habbo room: everyone in it who has voted gets 345 with the sum of the votes, never below 0, and the share of +1 votes; 345 is -1 for a habbo that has not voted, which shows the client's vote buttons (`knowledge/decisions/server/0082-a-rating-is-the-sum-and-the-share-of-up-votes.md`) |
| `CAN_CREATE_ROOMEVENT` (345) | 367: 1 for an owner of the habbo room it is in, which hosts no event yet |
| `CREATE_ROOMEVENT` (346), `EDIT_ROOMEVENT` (348) | A type 1 to `game.roomEventTypes`, 11, a name and a description of 3 characters or more, as the client asks them: the room gets 370 with the host's id and name, the room, the type, the name, the description and the start, `HH:MM` in UTC. An edit keeps the start. Events live only in memory and end when their host leaves the room or logs out (`knowledge/decisions/server/0081-eleven-room-event-types.md`) |
| `QUIT_ROOMEVENT` (347) | The host's event ends: the room gets 370 with `-1` |
| `GET_ROOMEVENT_TYPE_COUNT` (349) | 368: `game.roomEventTypes` |
| `GET_ROOMEVENTS_BY_TYPE` (350) | 369: the type and its events, by room: the room, the host, the name, the description and the start |
| `GET_GROUP_BADGES` (230) | 309: the favourite groups the room's habbos show, by id, with their badges (`knowledge/decisions/server/0068-a-habbo-shows-its-favourite-groups-badge.md`) |
| `GET_GROUP_DETAILS` (231) | 311: the group's name and description, and -1 and an empty name for its room, which groups have not; -1 alone for a group that does not exist |
| `GET_USER_TAGS` (263) | 350: the habbo's id and the tags of its profile on the site |
| `SETBADGE` (158) | Five times a slot and a code, empty for none: the habbo wears each badge it has, once, in the first slot that names it, saved; the room gets 228 with its web id and the badges it wears with their slots |

- A user line is `i` the index, `a` the habbo's id, `n` the name, `f` the
  figure, `l` the place, `c` the motto, `s` the sex and `b` the badges it wears,
  `<slot>:<code>` comma-separated, as Holo wrote them, then `g` the favourite group and `t` the habbo's
  status in it, 1 owner, 2 admin, 3 member, as the client's Group Info class
  reads them; each line ended by a carriage return, which no value may hold.
  The online habbo keeps its favourite group from its login. A status line is `<index> <x>,<y>,<height>,<head>,<body>/`,
  then each action and its parameters followed by a slash.
- The room's commands before `G_STAT` need the door to have let the habbo
  through; `G_HMAP`, `G_OBJS` and `G_ITEMS` also answer a habbo in the room.
- A habbo leaves its room on `QUIT`, on `#room_directory`, when its session
  ends and when it logs in again elsewhere. The last one out unloads the room
  (`knowledge/decisions/server/0071-an-empty-room-unloads-at-once.md`), and those
  still ringing get 131.
- Deleting a room sends the habbos in it out, as Holo did: each gets 18, and the
  others see it go.
- Each loaded room runs a clock, from its load to its unload
  (`knowledge/decisions/server/0072-each-loaded-room-runs-its-own-clock.md`). Every
  500 ms, the client's own step time
  (`knowledge/decisions/server/0065-walking-500-ms-by-holos-rules.md`), each
  walking habbo takes a step, and the statuses that changed, steps and turns,
  go to the room in one 34. A step's status stands where the habbo was, with
  `mv <x>,<y>,<height>` to where it goes, which the client animates; at its
  goal, or with no way to it, the habbo stops, and its status goes without
  `mv`.
- The way is the shortest, by A*, over the room's floor: 8 directions, each
  step the same time; a diagonal only when both tiles beside it are open, so
  nobody cuts a corner, which Holo's pathfinder checked on the wrong side for
  one diagonal; up or down at most 1 height; never onto another habbo's tile.
  A seat or a bed takes a habbo only as its goal, and sits or lays it facing
  the furni's way with `sit` or `lay` and the height of the furni's top,
  dropping its dance, as Holo did: `sit 1` on a public seat, `lay 1.5` on a
  bed 1.5 high.
- A habbo room's furni shapes the floor habbos walk on
  (`room_furni.go`, `virtual/room`): on each tile the highest furni decides.
  A solid blocks its tiles, unless it is a door that stands open; a seat and a
  bed take a habbo at their top; a rug leaves its tile open, and a habbo walks
  at the rug's height. A furni's length runs along x when it faces north or
  south and along y when it faces east or west, as Holo laid furni.
- The owner, the habbos with rights and the holders of
  `fuse_any_room_controller` place furni from their own hands and move the
  room's; only the owner and those holders pick furni up, and what they pick
  up becomes their user's, whoever placed it
  (`knowledge/decisions/server/0103-whoever-picks-a-furni-up-keeps-it.md`). A
  post-it is never picked up, and a wallpaper, a floor or a landscape never
  hung.
- A floor furni stands where every tile it covers takes furni, by Holo's
  rules: a tile the model allows, with nothing on it, with a solid that has a
  height, on whose top it stands, or with a rug, just above which it stands;
  never on a seat, a bed or a flat solid, and never where a habbo stands. It
  stands no higher than `game.maxStackHeight`, 20. A seat that is moved may
  come under a habbo, which then sits; a habbo whose seat or bed moves or goes
  stands up. A wall item's place is the client's text, each number 200 at most.
- A room holds at most `game.maxRoomFurni` furni, 500
  (`knowledge/decisions/server/0104-a-room-holds-up-to-500-furni.md`).
- One change to a room's furni runs at a time. Each writes its row, then the
  room's copy, then tells the room
  (`knowledge/decisions/server/0010-hot-data-written-at-once.md`).
- The client shows no button that deletes a furni, so `REMOVESTUFF` (99) is
  not handled.
- Rollers roll (`knowledge/decisions/server/0107-rollers-roll-every-two-seconds.md`):
  a roller's tile is open, and habbos and furni stand at its top. Every 2
  seconds, on the room's clock, each roller carries the furni of one tile
  that stand on it and the habbo that stands still on it, together, one tile
  the way it points. The next tile must be on the floor, hold no habbo and no
  furni but a roller, on whose top things land, and take furni by the model
  when furni comes. A roller ahead moves its load first, so a line of rollers
  passes a row of things along in one go; what cannot move stays and tries
  again. Each move saves the furni's place and tells the room with 230: the
  two tiles, each furni's id and altitudes, the roller's id, and 2 with the
  habbo's index and heights when one slid along, else 0.
- A post-it's text lives in its own table, `furni_notes`, so the room's copy of its furni carries no note text.
- Teleports follow the client's messages: `GETDOORFLAT` answers 62 for a partner in the same room too, and
  `GOVIADOOR` into another room answers 41 at once, where Holo answered 19.
- A furni's state is saved, then the room's copy changes, and the room is
  told. No client sets the state of a furni the server draws or writes: a
  dice, a bottle, the wheel, the randomizer, a trophy, a present, a post-it, a
  poster and the room dimmer. A number drawn is saved at once, so a habbo that
  comes in while it still rolls sees it.
- 32 carries the count of the floor furni, then each as an active object: its
  id and class, its tile, its length and width, its direction, its altitude,
  its colours, an empty runtime data, 0, and its state as the stuff data. 45
  carries a wall item a line: the id, the class, a space where the owner goes,
  its place on the wall and its state, or without one what its definition
  carries, a poster's number, tab-separated. A room that no habbo is in yet
  answers both from the store, and a loaded one from its own copy.
- A line keeps its first `game.chatMaxLength` characters, 100
  (`knowledge/decisions/server/0078-a-chat-line-is-cut-at-100-characters.md`), and
  is saved for staff (`knowledge/decisions/server/0066-staff-read-the-chat-history-30-days.md`),
  whispers with the habbo they went to. A habbo never gets the lines of a habbo
  it ignores. Nothing is filtered yet
  (`knowledge/decisions/server/0077-the-word-filter-waits.md`).
- After each line the speaker shows `talk` for (letters + 50) x 30 ms, and a
  chat or a shout with a smiley shows its face for 5 s, `gest sml`, `agr`, `sad`
  or `srp`, as Holo's `checkEmotion` found them. The room's clock ends each
  timed status on its tick and sends the change.
- A full room, public or habbo room, puts an arriving habbo in its queue
  (`knowledge/decisions/server/0087-every-full-room-queues.md`) and sends everyone
  waiting 259: two sets, `room`, target 1, and `spectators`, target 2, the
  habbo's own first, each with two queues, `club` and the set's own name, and
  how many of each come in before it
  (`knowledge/decisions/server/0090-queue-sets-room-and-spectators.md`). Club
  members come first (`knowledge/decisions/server/0088-club-members-first-in-a-queue.md`).
- A place that frees lets the next habbo in, which gets 69 for a public room
  or 41 for a habbo room, and keeps its place until it comes in, so that a
  newcomer cannot take it. A spectator's seat that frees lets the spectators'
  queue in, with 254 first; up to `game.maxSpectators`, 50, watch at once
  (`knowledge/decisions/server/0089-up-to-50-spectators-from-the-queue.md`).
- Spectators see what the room's habbos see, the chat and shouts too, but have
  no place, and cannot act. When the room empties, they get 283 and 18, and
  those still in its queues are let in.
