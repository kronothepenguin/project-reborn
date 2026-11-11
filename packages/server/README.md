# server — Go package

A Go module without a frontend. The app struct (`Server` struct) takes the
database in `New(db)`, which loads the settings, and registers its routes on a
mux in `Mount(mux)`, and `StartInfo` and `StartMus` start the WebSocket
listeners of the client's two connections; `apps/server` runs it.

## Layout

The game server is laid out as `plans/server/decisions/0005-package-layout.md`
decides. Each part is marked with the task of `plans/server/tasks/index.md`
that brings it. So far the package holds what `tools/create` generated,
`server.go` and `internal/router`, whose `GET /` answers `Hello from Go`, the
listeners of `server.go` and `mus.go`, `transport/`, `encoding/`, `r26/` and
`game/`.

| Part | Holds | Brought by |
| --- | --- | --- |
| `server.go` | `New(db)`, which loads the settings and reloads them (`plans/server/decisions/0050-the-server-loads-and-reloads-the-settings.md`), and `StartInfo` and `StartMus`, which start a WebSocket listener on the host and port of `server.info` and of `server.mus` (`plans/server/decisions/0020-info-and-mus-websocket-ports.md`, `plans/server/decisions/0022-start-info-and-start-mus.md`) | s0-03 generated `New(db)` and `Mount(mux)`; s0-07 the listeners; s2-06 the settings |
| `mus.go` | What the `mus` listener does until S7 frames MUS: it logs and never answers (`plans/server/decisions/0023-mus-listener-before-s7.md`) | s0-07 |
| `transport/` | `Conn`, an `io.Reader` to receive, an `io.Writer` to send and an `io.Closer`, over TCP (`tcp.go`) and the WebSocket (`websocket.go`) | s0-05 |
| `encoding/` | B64, VL64 and strings | s0-06 |
| `r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… | s0-07 the framing (`packet.go`), `HELLO` and the dispatch by id (`r26.go`) and the names of hh_entry_init's commands (`entry_init.go`); s2-06 the handshake and the login (`entry_init.go`); s2-07 what the client asks after it (`entry_init.go`, `club.go`, `shared.go`); s4-03 entering and leaving a room (`room.go`); each cast's handlers with the phase that serves the cast |
| `game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them | s2-05 the login and the logout; s2-07 the account, the club status and the sound setting; s4-03 entering and leaving rooms (`entering.go`); the other rules with the phases that bring them |

- `encoding` stands apart from `r26`, so that another protocol can reuse it.
- `game` never knows the protocol. It is its own package so that `r26` can call
  it without an import cycle.
- The server's state lives in `packages/virtual`, which holds only state.

## Transport

`transport` carries a client's bytes over TCP or a WebSocket
(`plans/server/decisions/0006-transport.md`). Both reach the protocol as a
`Conn`: `Read` receives, `Write` sends, `Close` closes and `RemoteAddr` is the
client's address. The protocol frames its own packets, so neither a read nor a
WebSocket frame has to be one packet.

- `ServeTCP(l, h)` serves each connection `l` accepts with the `Handler` `h`, in
  a goroutine of its own. It returns nil once `l` is closed, and the error of any
  other failed `Accept`.
- `WebSocket(h)` is an `http.Handler` on `golang.org/x/net/websocket`, mounted
  on any mux. It writes binary frames and reads the bytes of binary and text
  frames alike. Like `websocket.Handler`, it refuses a request whose `Origin`
  header is missing or not a URL. `RemoteAddr` is the HTTP request's
  `RemoteAddr`.
- A connection closes once its handler returns. Either end may close it sooner:
  the handler's `Read` returns `io.EOF` when the client closes, and `Close`
  from another goroutine ends a `Read` that is waiting.
- A `Conn`'s methods may be called from several goroutines at once.

## Encoding

`encoding` reads and writes the values of the R26 wire format byte for byte as
the client's scripts do (`fuse_client/51_Connection Instance Class.ls`, described
in `plans/server/reference/r26/fuse_client.md`). A reader takes its value from
the front of an `io.Reader` and reads no further; a writer writes it to an
`io.Writer`.

| Value | In the client | Read | Write |
| --- | --- | --- | --- |
| B64 of 2 characters: ids, shorts and string lengths | `msghandler`, `sendNew` `#short` | `ReadB64(r, 2)` | `WriteB64(w, v, 2)` |
| B64 of 3 characters: the length of a client's packet | `send`, `sendNew` | `ReadB64(r, 3)` | `WriteB64(w, v, 3)` |
| A byte, 0 to 63 | `GetByteFrom` | `ReadB64(r, 1)` | `WriteB64(w, v, 1)` |
| VL64, a 32-bit integer | `GetIntFrom`, `sendNew` `#integer` | `ReadVL64` | `WriteVL64` |
| A string that ends with `chr(2)` | `GetStrFrom` | `ReadString` | `WriteString` |
| A string after its B64 length | `sendNew` `#string` | `ReadB64String` | `WriteB64String` |
| A boolean, `@` or `A` | `GetBoolFrom`, `sendNew` `#boolean` | `ReadBool` | `WriteBool` |
| The raw rest of a body, as text | `tMsg.content`, `send` with text | `ReadRaw` | `WriteRaw` |

- Text is UTF-8 (`plans/server/decisions/0014-text-is-utf8.md`), with no locale
  conversion.
- A reader returns `io.EOF` when nothing is left, `io.ErrUnexpectedEOF` when the
  value is cut short, and an error wrapping `ErrMalformed` for bytes that are not
  the value: a VL64 count of 0 or 7, a VL64 beyond 32 bits, or text that is not
  UTF-8. It never panics.
- A writer refuses with an error wrapping `ErrUnencodable` a value the client
  would not read back as it was given: a B64 number too large for its
  characters, a string holding `chr(2)` or a B64-length string over 4095 bytes,
  or text that is not UTF-8.

## A connection

`StartInfo` and `StartMus` each open a WebSocket listener on the host and port
that `config.json` gives `server.info` or `server.mus`. Each returns an error
when it cannot listen, then serves in the background until the process ends,
and logs where it listens: `server: info on ws://localhost:30000`. There is no
shutdown yet. The standalone runner calls both, and the orchestrator will call
the same two (`plans/server/decisions/0022-start-info-and-start-mus.md`).

The transport hands each WebSocket to the handler of its connection as a
`Conn`, in a goroutine of its own, so that no session waits on another.

On `info`, `r26.Serve` speaks R26:

1. It sends `HELLO`: `@@` and the character 1. The client sends nothing before
   it.
2. It reads the client's packets one after another: 3 B64 characters of
   length, 2 of the command id, then the body. A WebSocket frame may hold
   several packets or a part of one.
3. It runs the handler registered for the id in the session's goroutine, so a
   session handles its packets in order. The handshake and the login have
   handlers ([The handshake and the login](#the-handshake-and-the-login)). A
   handler that closes the session leaves the packets after it unread.
4. A packet that no handler takes is logged as one line, with the session's
   address, the id, the name when `r26` knows it and the size of the body,
   never the body (`plans/server/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md`):
   `r26 127.0.0.1:53422 unhandled TRY_LOGIN (756), 18 bytes`, or
   `r26 127.0.0.1:53422 unhandled 999, 3 bytes` for an id it does not know.
   `r26` knows the 22 commands of hh_entry_init. The session goes on.
5. The session ends when the client leaves, which is no error and is not
   logged: the client closes, and first writes one byte 0 where a packet would
   start. A session the server closes ends without a log line either. Either
   way, the habbo the session logged in is logged out
   (`game.Logout`).
6. A length too short to hold the id, or a packet cut short, ends the session
   and is logged:
   `r26 127.0.0.1:53422 closed: encoding: malformed value: a packet length of 1, too short for its id`.
   Every other session goes on.

`r26` frames a message as 2 B64 characters of its id, the body and the
character 1. The client ends a message at its first character 1, so a body that
holds one is refused with an error wrapping `encoding.ErrUnencodable`.

Each session sends through an outbox
(`plans/server/decisions/0073-each-session-sends-through-an-outbox.md`):

- Sending queues the message, and a goroutine of the session's own writes the
  queue in order, one message per `Write`. So sending never waits for the
  client, even from another session's goroutine, as a room's messages will.
- The queue holds `game.outboxSize` messages, 500 by default, read as the
  session starts. A client whose queue is full has stopped reading: its session
  ends at once and is logged, `r26 127.0.0.1:53422 closed: 500 messages waiting`.
- A session the server ends, as on a wrong `VERSIONCHECK` or a second login,
  writes what it sent before, then closes. The ping loop's timeout closes at
  once, without writing what waits, and keeps running until the writing is
  done, so it also ends a session whose last messages wait on a client that
  stopped reading.
- Once a session has ended, what is sent to it goes nowhere.

On `mus`, until S7 frames MUS, the server logs the connect, the size of each
message and the close, and never answers
(`plans/server/decisions/0023-mus-listener-before-s7.md`):
`mus 127.0.0.1:53422 connected`, `mus 127.0.0.1:53422 received 11 bytes` and
`mus 127.0.0.1:53422 closed`. The transport hides the WebSocket's frames, so a
size is what one read brings: never more than one message, and a large message
may come in several reads.

- The server logs through the default logger of `log/slog`.
- A panic in a session does not end the server: `net/http` recovers it and logs
  it, and the transport closes that connection. Over TCP, which no listener
  serves yet, it would end the process.

## The handshake and the login

`r26`'s handlers of hh_entry_init take a client from `HELLO` to `LOGIN_OK`
(`plans/server/reference/r26/hh_entry_init.md`):

| Command | Answer |
| --- | --- |
| `INIT_CRYPTO` (206) | `CRYPTOPARAMETERS` (277) with 0, then `ENDOFCRYPTOPARAMS` (278) at once: nothing is enciphered. `GENERATEKEY`, which the client sends after 277, has no handler and is logged as unhandled (`plans/server/decisions/0027-endofcryptoparams-right-after-cryptoparameters.md`) |
| `VERSIONCHECK` (1170) | Nothing when the version is `game.clientVersion` and both URLs are empty or on `site.url`: the URL itself or the URL followed by `/`. Any other client, or a body that cannot be read, gets 33 `Version not correct`, and the server closes the connection (`plans/server/decisions/0049-a-wrong-version-is-closed.md`) |
| `UNIQUEID` (813) | Nothing: the session keeps the machine id for the login |
| `GET_SESSION_PARAMETERS` (1817) | 257 with the ten session parameters, ids 0 to 9, from their `game.` settings; a flag goes out as 0 or 1 |
| `SSO` (204) | The habbo's fuses (2), then `LOGIN_OK` (3), as Holo sent them, once `game.Login` logs the ticket's habbo in; 33 `login incorrect` for a ticket that is not valid. Before a `VERSIONCHECK` that passed, 33 `Version not correct` and the close. A session logs in once, and later `SSO`s get no answer. A failure of the database is logged and closes the session |
| `TRY_LOGIN` (756) | 33 `login incorrect`, always: a habbo logs in only with `SSO` (`plans/server/decisions/0028-sso-only.md`) |

## After the login

The client asks these right after `LOGIN_OK`; before it, they get no answer.
Each cast's commands have their file: `entry_init.go`, `club.go` for hh_club
and `shared.go` for hh_shared.

| Command | Answer |
| --- | --- |
| `GET_INFO` (7) | The user object (5): the habbo's id, name, figure, gender and motto, the user's tickets, an empty pool figure, the user's film, and 1 for direct mail when the user takes the newsletter |
| `GET_CREDITS` (8) | hh_cat_code's purse (6): the user's credits as text |
| `GETAVAILABLEBADGES` (157) | 229: the habbo's badges, then those it wears, each with its slot, 1 to 5 (`plans/server/decisions/0083-a-habbo-wears-five-badges-in-slots.md`) |
| `GET_SOUND_SETTING` (228) | 308: 1 when the sound is on, 0 when off |
| `SET_SOUND_SETTING` (229) | Nothing: `game.SetSoundEnabled` saves it, 0 off and any other value on |
| `GET_POSSIBLE_ACHIEVEMENTS` (370) | 436 with no achievement (`plans/server/decisions/0051-no-achievements-yet.md`) |
| `SCR_GET_USER_INFO` (26) | 7: `club_habbo`, the days left of the running period, the elapsed periods, the prepaid periods, and the response 1, which opens no window (`plans/server/decisions/0052-club-status-by-days-per-month.md`) |
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
  (`plans/server/decisions/0050-the-server-loads-and-reloads-the-settings.md`).
- `New(db)` also loads what every player shares into `virtual`: the
  navigator's categories, models and public rooms, then the furni definitions
  and the catalogue that reads them
  (`plans/server/decisions/0098-virtual-furni-and-catalogue.md`). While updates
  wait, it logs
  `server: the navigator and the catalogue wait for the database updates`, and
  the first reload after they are applied loads them
  (`plans/server/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md`).

## The navigator

`navigator.go` serves hh_navigator once the habbo is logged in, from the shared
data of `virtual/category`, `virtual/model` and `virtual/room` and the store
(`plans/server/reference/r26/hh_navigator.md`):

| Command | Answer |
| --- | --- |
| `NAVIGATE` (150) | 220: the category, the categories right under it that the habbo may see, and its public rooms (type 1) or its habbo rooms (type 2), at most `game.categoryMaxRooms`, the busiest first. Node mask 1 leaves full rooms out. A category that does not exist or hides itself from the habbo's level gets no answer |
| `GETUSERFLATCATS` (151) | 221: the categories of habbo rooms below the root that the habbo's level reaches |
| `GETPARENTCHAIN` (156) | 227: the category and those above it, nearest first |
| `GETSPACENODEUSERS` (154) | 223: the names of the habbos in a public room, by index, as Holo listed them |
| `REMOVEALLRIGHTS` (155) | Nothing: the owner's room loses every habbo's rights, from the modify page; those in the room get 43 |
| `SUSERF` (16) | 16: the habbo's own rooms, as lines of text; 57 when it has none. The session's habbo is the one listed, whatever name the client sends |
| `SRCHF` (17) | 55: the rooms whose name holds the query or whose owner it names, at most `game.searchMaxRooms`; 58 when none matches |
| `GET_RECOMMENDED_ROOMS` (264) | 351: three habbo rooms drawn at random (`plans/server/decisions/0057-three-random-recommended-rooms.md`) |
| `GETFVRF` (18) | 61: a header node of type 2 with the favourite habbo rooms as its flats, then the favourite public rooms as nodes of type 1, each under its category |
| `ADD_FAVORITE_ROOM` (19) | Nothing: the room, type 1 public or 0 a habbo room, becomes a favourite; past `game.maxFavouriteRooms`, 33 `Only 10 favorite rooms allowed!` (`plans/server/decisions/0058-favourites-saved-up-to-30.md`). A room that does not exist changes nothing |
| `DEL_FAVORITE_ROOM` (20) | Nothing: the room stops being a favourite |
| `CREATEFLAT` (29), in `kiosk_room.go` | 59, the new room's id and name on two lines of text, for a room the habbo creates and owns: up to `game.maxRoomsPerHabbo`, a name of 1 to 50 characters without control characters, a model habbos build on, a club one only with `fuse_use_special_room_layouts`, and one of the client's three doors. Otherwise 33 `Error creating a private room`. A new room sits in No category until `SETFLATCAT` (`plans/server/decisions/0056-own-rooms-follow-holos-rules.md`) |
| `SETFLATCAT` (153) | Nothing: the owner's room goes to a category its level lets it use |
| `GETFLATINFO` (21) | 54: the room's settings, with `model_<model>` as its marker, the category's trading flag, 0 for the alert no script reads, and 25 as the absolute most visitors, which caps the navigator's modify page. A room that does not exist gets no answer |
| `GETFLATCAT` (152) | 222: the owner's room and its category; another habbo's room gets no answer |
| `UPDATEFLAT` (24) | Nothing: the owner's room takes the name, the door and whether to show the owner, by `CREATEFLAT`'s rules |
| `DELETEFLAT` (23) | Nothing: the owner's room goes, with the favourites that name it, after the furni that stands in it went to the owner's hand, whoever placed it (`plans/server/decisions/0059-a-deleted-rooms-furni-goes-to-its-owner.md`) |
| `SETFLATINFO` (25) | Nothing: the owner's room takes the description, cut at 125 characters and without control characters; a password of 1 to 32 characters, stored hashed (`plans/server/decisions/0062-room-passwords-are-hashed.md`); whether others move furniture; and 10 to 25 visitors. A change the rules refuse in any field changes nothing. Both the navigator's form, `<id>/`, and the room-o-matic's, `/<id>/`, are read |

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

## The catalogue

`cat_code.go` serves hh_cat_code once the habbo is logged in, from the shared
data of `virtual/catalogue` (`plans/server/reference/r26/hh_cat_code.md`):

| Command | Answer |
| --- | --- |
| `GCIX` (101) | 126: the pages the habbo sees, in the catalogue's order, a line each: the page's code, a tab and its name. A habbo sees a page when its access group level reaches the page's, or when the page is open to the club and its user is a member (`plans/server/decisions/0100-sixteen-pages-need-level-7-and-two-the-club.md`) |
| `GPRC` (100) | 67 and 6 with the new balance: the item of the page, both named by their codes, is bought with the credits of the habbo's user, and its furni lands in the habbo's hand. 68 when the credits are not enough; 296 with 1 when the page sells only to club members and the habbo's user is not one (`plans/server/decisions/0102-club-furni-and-club-shop-sell-to-club-members.md`); 65 when the page does not exist, the habbo does not see it or it sells no such item. None of the three charges |
| `GCAP` (102) | 127: the page the client names by its code, a line per value: `i` the code, `n` the name, `l` the layout, then those the page has of `g`, `e`, `h`, `w` and `s`, its numbered texts as `t<n>`, and a `p` line for each item it sells. A page that does not exist or that the habbo does not see gets no answer |

- The client names a page by its code and reads the page `Recycler` by that
  name, so the code is Holo's index name, and a page's name is what the list
  shows: `Recycler` is listed as Ecotron.
- A `p` line's values are separated by tabs: name, description, price, an
  empty special text, the object type, the class, the direction, the
  dimensions, the purchase code and the part colours. A floor furni is `s`,
  with direction 0 and its length and width; a wall item is `i`, its class the
  sprite and, after a space, its data, as in `poster 44`; a deal, an item that
  gives more than one piece, is `d`, followed by the count of its furni and
  each one's class, pieces and colours.
- A teleport, `door`, `doorB`, `doorC`, `doorD` or `teleport_door`, comes as two furni
  that name each other, as Holo sold it; in a present, both wait in the box.
- The purchase code is the item's own code, which `GPRC` sends back. The
  client shows the picture `ctlg_pic_<code>` when its cast holds one, as it
  does for the pet food packs, `deal97` to `deal99`.
- A purchase is one transaction: the wallet pays, its history gets the line
  `Catalogue purchase (<item>)` under the reason `catalogue`, and each piece
  the item gives becomes a furni in the buyer's hand, six for a pet food pack.
  The wallet belongs to the user, so every habbo of the user pays from it.
- A furni bought on a page of the layout `ctlg_trophies` keeps the buyer's
  name, the day as dd-mm-yyyy and the inscription, cut at 150 characters,
  separated by tabs, as the client's trophy reads its state. One bought on the
  `ctlg_spaces` page keeps the pattern the client sends, digits with at most
  one dot. A pad of post-its starts with 20 notes.
- After 67 the client shows the purchase as done and, in a habbo room, opens
  the hand by itself, which asks for it with `GETSTRIP`.
- A gift, the order's sixth line 1, buys for the habbo its seventh line
  names, online or not
  (`plans/server/decisions/0094-any-habbo-sends-a-present-to-any-habbo.md`):
  the furni waits in one of the six boxes, `present_gen1` to `present_gen6`,
  drawn at random, in the receiver's hand, and belongs to the receiver's user.
  The box's state is `!` and the note, its control characters turned into
  spaces and cut at `game.presentNoteMaxLength`, 200. The buyer pays, and its
  history's line ends with `, a present for <name>`. A name that no habbo has
  gets 76 with the name and charges nothing. A receiver that is in a room gets
  101, on which its client asks for its hand.
- The edit mode and the language the client sends change nothing. A tab, a
  line break or another control character in a value becomes a space.
- The level and the club are read from the store each time, since the site
  changes them; the client keeps the index and each page for the session.

## The hand

`room_hand.go` serves the hand, the furni a habbo carries, which hh_room's
Room Handler asks for (`plans/server/reference/r26/hh_room.md`):

| Command | Answer |
| --- | --- |
| `GETSTRIP` (65) | 140: a page of the hand, nine furni, the oldest first. `new` gives the first page, `next` and `prev` the one after and before, stopping at the last and the first, and `update` the same page again |

- The hand lives in the store, and every `GETSTRIP` reads it there, so what the
  site or another habbo gives shows the next time the hand opens
  (`plans/server/decisions/0096-the-hand-is-read-from-the-database.md`). Only
  the page the client is on lives in the session.
- 140 carries each furni ended by a slash, its values separated by the
  character 30: `SI`, the strip id, the place in the whole hand from 0, `S` or
  `I`, the id and the class; then for a floor furni, `S`, its length, width,
  state, colours and 1 when it is recyclable, and for a wall item, `I`, its
  data, a poster's number, and 1 when it is recyclable. After a carriage
  return comes how many furni the hand holds, from which the client lights its
  next button. The strip id is the furni's id.
- A slash or a control character in a value becomes a space, so no state
  breaks the list.

## Rooms

`room.go` serves hh_room once the habbo is logged in
(`plans/server/reference/r26/hh_room.md`). A room is entered as the client
does it: the ad while it loads, the door, the room's parts, then the habbo
comes in once its client has built the room, at `G_STAT`, as Holo had it.

| Command | Answer |
| --- | --- |
| `GETINTERST` (182) | 258: `game.loadingAdImage`, a tab and `game.loadingAdLink`, or `0`, which shows no ad (`plans/server/decisions/0070-a-loading-ad-and-a-room-ad-from-settings.md`) |
| `#room_directory` (2) | 19, for both kinds, as Holo sent it. The habbo leaves the room it is in or rings. A public room, named by its id, then gets 69, `<model> <id>`, or joins its queue when it is full. A habbo room goes on with `TRYFLAT` |
| `GOVIADOOR` (54) | `<flat id>/<teleport id>`, through the passage `GETDOORFLAT` opened. In the room the habbo is in, it stands in the other teleport at once: the room gets its status and 92, `<teleport id>/<name>`. Into another room, which it chose with `#room_directory`, 41 with an empty name lets it in past the doorbell, the password, a ban and a full room (`plans/server/decisions/0110-a-teleport-skips-every-check-of-the-door.md`); it goes on with `GOTOFLAT`, arrives in the teleport, and the others get 92 |
| `TRYFLAT` (57) | 41 with an empty name lets the habbo in. A full room queues it. The owner and the holders of `fuse_enter_locked_rooms` pass any door and any ban; anyone else banned gets 224 with 4; a password door compares `<id>/<password>` with the room's hash (`plans/server/decisions/0062-room-passwords-are-hashed.md`), or 33 `Incorrect flat password`; a closed door gets 91 and rings the doorbell of the habbos with rights in the room, who get 91 with the ringer's name. A room that is not loaded, or holds nobody who may answer, gets 131 at once, as Holo did with nobody in |
| `LETUSERIN` (98) | From a habbo with rights in the room: the ringer gets 41 and goes on with `GOTOFLAT`, or 131; the habbos with rights get 41 or 131 with its name, which their doorbells drop. A ringer who leaves is dropped the same way |
| `GOTOFLAT` (59) | 69, `model_<model> <id>`; then 46 for each of the room's landscape, wallpaper and floor that was set, `<property>/<pattern>`; then 47 for the owner and 42 for a habbo with rights; then the room's rating, 345, and its event, 370, as Holo sent them. The holders of `fuse_any_room_controller` count as owners, as Holo had it. Only after the door let the habbo through |
| `GETROOMAD` (126) | 208: `game.roomAdImage`, a tab and `game.roomAdLink`, or `0` |
| `G_HMAP` (60) | 31: the model's height map, a row per line |
| `G_USRS` (61) | 28: the user lines of the habbos in the room |
| `G_OBJS` (62) | 30: the model's public furni, `<id> <class> <x> <y> <height> <direction>` a line, then 32 with the floor furni that stands in the room, which no command asks for and the client needs |
| `G_ITEMS` (63) | 45: the wall items that stand in the room, a line each |
| `FLATPROPBYITEM` (66) | 46 to the room, `<property>/<pattern>`: the wallpaper, the floor or the landscape of the habbo's hand, `<class>/<strip id>`, is used up on the room, which keeps the pattern the furni was bought with. A habbo that controls the room decorates it, as Holo let it |
| `PLACESTUFF` (90) | Nothing to the sender alone: the furni of its hand stands in the room, and everyone in it gets 93 for a floor furni, `<strip id> <x> <y> <direction>`, or 83 for a wall item, `<strip id> :w=<x>,<y> l=<x>,<y> <r or l>`. A furni that may not stand there stays in the hand. A pad of post-its stays in the hand too: one note leaves it for the wall as a new, yellow wall item, the pad counts one fewer and goes with its last, and the sender gets 101 |
| `TRADE_OPEN` (71) | 108 to both: a trade opens with the habbo whose room index is the body, in any room (`plans/server/decisions/0112-habbos-trade-in-any-room.md`), and both show the status `trd`. A habbo trades with one habbo at a time. 102 when the sender holds no `fuse_trade`, 103 when the other holds none |
| `TRADE_ADDITEM` (72) | 108 to both, a line a side, the receiver's own first: `<name>` TAB `<true or false>` TAB the furni on offer, written as in the hand. A tradeable furni of the hand is offered once, up to `game.maxTradeFurni`, 65, a side; it takes both accepts away, and stays in the hand, where it is not placed or used up until the trade ends (`plans/server/decisions/0114-a-furni-on-offer-is-locked.md`) |
| `TRADE_ACCEPT` (69) | 109 to both, `<name>/true`. When both have accepted, every furni on offer changes hands in one transaction and both get 110; a furni that left its hand meanwhile undoes it all |
| `TRADE_UNACCEPT` (68) | 109 to both for each side that had accepted, `<name>/false`: both accepts go, as in Holo |
| `TRADE_CLOSE` (70) | 110 to both: the trade ends and nothing changes hands. Leaving the room or losing the connection does the same for the other habbo |
| `MOVESTUFF` (73) | 95 to the room: the floor furni stands on the new tile or turned. A furni that may not stand there stays, and its mover alone gets 95 with it where it is |
| `SETSTUFFDATA` (74) | 88 to the room, the furni's id and its new state: anyone in the room sets a floor furni's state, a lamp `ON`. Only a habbo that controls the room opens and closes a door furni, `O` and `C`, and a door closes only while nobody stands in it. A state longer than 32 characters is refused |
| `GETDOORFLAT` (28) | 62, the other teleport's id and its room's, for a habbo that stands in the teleport named by its id as text. Nothing while the other of the pair stands in no room (`plans/server/decisions/0111-a-teleport-keeps-its-partner.md`) |
| `INTODOOR` (81) | The habbo steps into the teleport from the tile in front of it, the one the teleport faces: its status goes to the room at once, with `mv`. A teleport's tile takes no walk otherwise |
| `DOORGOIN` (82) | 89 to the room, the id of the teleport the habbo stands in |
| `G_IDATA` (83) | 48, `<id>` TAB `<colour> <text>`: what is written on a post-it of the room, for anyone in it |
| `SETITEMDATA` (84) | 85 to the room, the post-it's line with its colour: a habbo that controls the room writes `<id>/<colour> <text>`. A `post.it` takes the four colours of the client's window; a text longer than `game.postItMaxLength`, 684, is refused (`plans/server/decisions/0108-rights-write-notes-owner-and-staff-delete.md`, `0109-post-it-length-is-a-setting.md`) |
| `REMOVEITEM` (85) | 84 to the room: the room's owner, or a holder of `fuse_remove_stickies`, deletes a post-it for good. Nothing else is deleted this way, and a post-it is never picked up |
| `SETITEMSTATE` (214) | 85 to the room, the wall item's line with its new state |
| `THROW_DICE` (76), `DICE_OFF` (77) | 90 to the room: the dice's id while it rolls, then two seconds later the id and its face, 1 to 6, plus 38 times the id; `DICE_OFF` shows no face. The habbo stands on a tile beside the dice. A bottle spins the same way and points one of eight ways |
| `CONVERT_FURNI_TO_CREDITS` (183) | 94 to the room and 6, the new balance, to the sender: the room's owner turns a credit furni that stands in the room, named by its id as a number, back into credits (`plans/server/decisions/0115-the-rooms-owner-redeems-credit-furni.md`). The furni is destroyed, the wallet of the habbo's user gets its worth, the number in its sprite, 50 for `CF_50_goldbar`, and the credit history the line `Furni exchanged (<item>)` under the reason `exchange`, in one transaction. Any other furni is left alone |
| `SPIN_WHEEL_OF_FORTUNE` (247) | 85 to the room: the wheel's line with -1 while it spins, and with its number, 0 to 9, 4.25 seconds later; for a habbo that controls the room |
| `SET_RANDOM_STATE` (314) | 88 to the room: the love randomizer's state `123456789` while it runs, and its number, 1 to 4, five seconds later |
| `CARRYDRINK` (80) | Nothing but the habbo's status: `carryd` and the drink's token, 1 to 26, for 9 seconds, then `drink` for 1, ten times over, as Holo's habbos sipped; never while it lies. A dance or `STOP CarryItem` takes the drink away |
| `PRESENTOPEN` (78) | 94 to the room, then 129 and 140 to the opener: the box that stands in the opener's own room goes, what waited in it lands in the opener's hand, 129 shows the last of it on the box's card, the class, the class with a wall item's data, and the colours, and the hand comes at its last page. Only the room's owner opens a box (`plans/server/decisions/0105-only-a-rooms-owner-opens-a-present.md`) |
| `ADDSTRIPITEM` (67) | 94 or 84 to the room, and 140 to the picker: the furni leaves the room for the picker's hand, `new stuff <id>` a floor furni and `new item <id>` a wall item |
| `G_STAT` (64) | The habbo comes in at the model's door: 34 with the others' statuses, then 28 with its own user lines and 34 with its status, which the others get too. In a habbo room the owner's status holds `flatctrl useradmin` and a habbo with rights `flatctrl` with no level, which the client's Human class reads as `furniture`; Holo's `onlyfurniture` was another client's. A room that filled meanwhile queues the habbo. A spectator gets the statuses alone and comes into no place |
| `QUIT` (53) | Nothing: the habbo leaves, and the others get 29 with its index |
| `ROOM_QUEUE_CHANGE` (211) | The habbo waiting in a full room's line moves to the line its target names, 1 the room's and 2 the spectators', at its end (`plans/server/decisions/0089-up-to-50-spectators-from-the-queue.md`) |
| `GET_SPECTATOR_AMOUNT` (216) | 298: how many watch the habbo's room and `game.maxSpectators`, or -1 for a habbo that watches none, which hides the client's count |
| `MOVE` (75) | Nothing at once: the habbo walks to the tile, two B64 shorts, a step on each tick of the room's clock. A tile off the floor, such as the 1000, 1000 of the sound machine's editor, changes nothing |
| `LOOKTO` (79) | The habbo turns, head and body, to the tile `<x> <y>`, unless it sits or lies, as Holo had it; its status goes out on the next tick |
| `CHAT` (52), in `room_utils.go` | 24 with the speaker's index and the text to the habbos within `game.chatRange` tiles each way, 5, as Holo had it; the farther ones get 24 with no text, which the client draws as its unheard bubble (`plans/server/decisions/0074-near-habbos-read-chat-far-ones-see-a-bubble.md`) |
| `SHOUT` (55), in `room_utils.go` | 26 to everyone in the room |
| `WHISPER` (56), in `room_utils.go` | `<name> <text>`: 25 to the named habbo and the speaker only, and to nobody when the name is not in the room, as Holo had it |
| `USER_START_TYPING` (317), `USER_CANCEL_TYPING` (318) | 361 to the room: the habbo's index and 1 or 0. A line ends the typing, and the room gets 361 with 0 first, as Holo sent it |
| `DANCE` (93) | With no body the normal dance, `dance`; with 1 to 4 a club dance, `dance <n>`, for the holders of `fuse_use_club_dance`; never while sitting or lying |
| `WAVE` (94) | `wave` for 1.5 s, which stops a dance (`plans/server/decisions/0075-talking-smileys-and-waves-as-holo.md`) |
| `STOP` (88) | `Dance` ends the dance; carrying waits for drinks |
| `IGNOREUSER` (319), `UNIGNORE_USER` (322) | 419: 0 failed (no such habbo, or the habbo itself), 1 added, 2 added with the oldest dropped past `game.maxIgnoredHabbos`, 100, or 3 removed (`plans/server/decisions/0076-ignore-up-to-100-the-oldest-dropped.md`) |
| `GET_IGNORE_LIST` (321) | 420: the names the habbo ignores, oldest first |
| `ASSIGNRIGHTS` (96), `REMOVERIGHTS` (97) | From the room's owner, or a holder of `fuse_any_room_controller`, about a habbo in the room, as the client shows the buttons: saved, then the habbo gets 42 or 43, and its status gains or loses `flatctrl` |
| `KICKUSER` (95) | From an owner or a habbo with rights, as the client shows the button: the habbo, never an owner or a holder of `fuse_any_room_controller`, walks to the door, a step every 500 ms and no longer where it wants, and leaves there with 18; it leaves at once when it cannot reach the door, which a habbo standing on it blocks (`plans/server/decisions/0079-a-kicked-habbo-walks-out.md`) |
| `BANUSER` (320) | From an owner only, as the client shows the button: the habbo is banned for `game.roomBanMinutes`, 15 (`plans/server/decisions/0067-a-room-ban-lasts-15-minutes.md`), saved and in the room's copy, and walks out as on `KICKUSER`; its next `TRYFLAT` gets 224 with 4 |
| `RATEFLAT` (261) | A vote, 1 or -1, once, in a habbo room: everyone in it who has voted gets 345 with the sum of the votes, never below 0, and the share of +1 votes; 345 is -1 for a habbo that has not voted, which shows the client's vote buttons (`plans/server/decisions/0082-a-rating-is-the-sum-and-the-share-of-up-votes.md`) |
| `CAN_CREATE_ROOMEVENT` (345) | 367: 1 for an owner of the habbo room it is in, which hosts no event yet |
| `CREATE_ROOMEVENT` (346), `EDIT_ROOMEVENT` (348) | A type 1 to `game.roomEventTypes`, 11, a name and a description of 3 characters or more, as the client asks them: the room gets 370 with the host's id and name, the room, the type, the name, the description and the start, `HH:MM` in UTC. An edit keeps the start. Events live only in memory and end when their host leaves the room or logs out (`plans/server/decisions/0081-eleven-room-event-types.md`) |
| `QUIT_ROOMEVENT` (347) | The host's event ends: the room gets 370 with `-1` |
| `GET_ROOMEVENT_TYPE_COUNT` (349) | 368: `game.roomEventTypes` |
| `GET_ROOMEVENTS_BY_TYPE` (350) | 369: the type and its events, by room: the room, the host, the name, the description and the start |
| `GET_GROUP_BADGES` (230) | 309: the favourite groups the room's habbos show, by id, with their badges (`plans/server/decisions/0068-a-habbo-shows-its-favourite-groups-badge.md`) |
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
  (`plans/server/decisions/0071-an-empty-room-unloads-at-once.md`), and those
  still ringing get 131.
- Deleting a room sends the habbos in it out, as Holo did: each gets 18, and the
  others see it go.
- Each loaded room runs a clock, from its load to its unload
  (`plans/server/decisions/0072-each-loaded-room-runs-its-own-clock.md`). Every
  500 ms, the client's own step time
  (`plans/server/decisions/0065-walking-500-ms-by-holos-rules.md`), each
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
  (`plans/server/decisions/0103-whoever-picks-a-furni-up-keeps-it.md`). A
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
  (`plans/server/decisions/0104-a-room-holds-up-to-500-furni.md`).
- One change to a room's furni runs at a time. Each writes its row, then the
  room's copy, then tells the room
  (`plans/server/decisions/0010-hot-data-written-at-once.md`).
- The client shows no button that deletes a furni, so `REMOVESTUFF` (99) is
  not handled.
- Rollers roll (`plans/server/decisions/0107-rollers-roll-every-two-seconds.md`):
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
  (`plans/server/decisions/0078-a-chat-line-is-cut-at-100-characters.md`), and
  is saved for staff (`plans/server/decisions/0066-staff-read-the-chat-history-30-days.md`),
  whispers with the habbo they went to. A habbo never gets the lines of a habbo
  it ignores. Nothing is filtered yet
  (`plans/server/decisions/0077-the-word-filter-waits.md`).
- After each line the speaker shows `talk` for (letters + 50) x 30 ms, and a
  chat or a shout with a smiley shows its face for 5 s, `gest sml`, `agr`, `sad`
  or `srp`, as Holo's `checkEmotion` found them. The room's clock ends each
  timed status on its tick and sends the change.
- A full room, public or habbo room, puts an arriving habbo in its queue
  (`plans/server/decisions/0087-every-full-room-queues.md`) and sends everyone
  waiting 259: two sets, `room`, target 1, and `spectators`, target 2, the
  habbo's own first, each with two queues, `club` and the set's own name, and
  how many of each come in before it
  (`plans/server/decisions/0090-queue-sets-room-and-spectators.md`). Club
  members come first (`plans/server/decisions/0088-club-members-first-in-a-queue.md`).
- A place that frees lets the next habbo in, which gets 69 for a public room
  or 41 for a habbo room, and keeps its place until it comes in, so that a
  newcomer cannot take it. A spectator's seat that frees lets the spectators'
  queue in, with 254 first; up to `game.maxSpectators`, 50, watch at once
  (`plans/server/decisions/0089-up-to-50-spectators-from-the-queue.md`).
- Spectators see what the room's habbos see, the chat and shouts too, but have
  no place, and cannot act. When the room empties, they get 283 and 18, and
  those still in its queues are let in.

## Keeping the session alive

Every session, from `HELLO` on, is pinged
(`plans/server/decisions/0042-ping-every-30-seconds.md`):

- The server sends `PING` (50) every `game.pingSeconds`, 30 by default, and
  the client answers `PONG` (196) at once.
- A session that goes `game.pongTimeoutSeconds`, 90 by default, without a
  `PONG` is closed and logged, `r26 127.0.0.1:53422 closed: no PONG for 1m30s`,
  and its habbo logged out. The timeout must be longer than the interval.
- Both settings are read again each time the session wakes, for its next
  `PING` or for its timeout, whichever comes first.
- `TEST_LATENCY` (315) gets 354 with the id it carries, and `REPORT_LATENCY`
  (316) is logged, never saved
  (`plans/server/decisions/0036-latency-reports-are-logged.md`):
  `r26 127.0.0.1:53422 latency: mean 120 ms, 110 ms below twice the mean, 15 answers`.
- The server sends no error report (299) yet: S7 decides when it does
  (`plans/server/decisions/0054-error-reports-wait-for-s7.md`).

## Game

`game` holds the rules, which each protocol's handlers call. A rule changes the
state in `packages/virtual` and writes the database, and reaches a habbo's
client through its `Session` (`plans/server/decisions/0039-rules-notify-sessions-through-an-interface.md`).

- `Session` is the interface `virtual/habbo` declares, `Notify(event any)`
  (`plans/server/decisions/0048-sessions-through-an-interface-virtual-declares.md`).
  Each protocol's session implements it on a pointer and turns every event into
  its messages.
- The events are structs of `game`. `ConcurrentLogin{}` tells a session that its
  habbo logged in on another one, which replaces it; `r26` answers it with 287,
  reason 2 (`plans/server/decisions/0029-a-second-login-closes-the-first.md`).
- `Login(ctx, db, s, ticket, machineID)` spends the SSO ticket and returns the
  habbo it names, online on `s`. In one transaction it spends the ticket, reads
  the habbo, its badges and its sound setting, and saves the machine id, when
  `s` holds one, and the last time online; after the commit it reads the fuses
  with `auth.Fuses`. Then the habbo goes online with them
  (`plans/server/decisions/0053-the-online-habbo-holds-its-own-data.md`), and
  the session it was online on leaves its room and gets `ConcurrentLogin`. A ticket that is unknown, spent, or whose CMS session ended
  or moved to another habbo returns `ErrInvalidTicket`.
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
  (`plans/server/decisions/0084-the-game-server-prunes-the-chat-hourly.md`).
  Housekeeping's Chat Log Viewer reads the lines.
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

## Port

- App (Go HTTP server): **15445** — baked in `apps/server/cmd/server`
- `info` and `mus` (WebSocket listeners): **30000** and **30001** by default,
  the ports of `server.info` and `server.mus` in `config.json`

## Tests

`TestMain` writes a `config.json` with free ports, opens one database that
every test shares, and starts both listeners once. `client_test.go` is a test
client that speaks R26 over a WebSocket as the client does on LibreShockwave,
one binary frame per write. Tests insert their own users, CMS sessions and SSO
tickets, as `plans/server/decisions/0030-sso-tickets-from-the-cms-sign-in.md`
says, and each uses habbos of its own.

- S0's exit criterion: `TestInfoSendsHelloAndLogsAnUnhandledCommandByName`.
- S2's: `TestAClientLogsInEndToEnd`, from `HELLO` to the second login that
  ends the first session, and `TestACMSSignInMakesATicketTheServerAcceptsOnce`,
  which signs in through `packages/auth` as the CMS does.
- S3's: `TestAClientBrowsesTheNavigator`, every list of the navigator against
  its limits in one session, and `TestAHabboBuildsChangesAndDeletesARoom`, the
  room-o-matic up to the 50th room, its settings, its changes and its deletion.
- S4's: `TestHabbosLiveInRooms`, two habbos in a public room and a habbo room,
  walking, chatting, whispering, shouting, typing, dancing and waving, with the
  ads, the saved and pruned chat and the rooms unloading;
  `TestAnOwnerKeepsItsRoom`, the password, the doorbell, rights, a kick, a
  15-minute ban and a full room's queue; and `TestAHabbosLifeInARoom`, a rating,
  an ignore, an event, five badge slots and a favourite group.
- `entering_test.go` enters public rooms and habbo rooms through every door,
  the doorbell, bans, full rooms, a deletion, a logout and the ads.
- `chat_test.go` chats near and far, shouts, whispers, types, ignores up to the
  limit, dances and waves.
- `extras_test.go` rates a room, hosts an event and lists it, and shows groups
  and tags.
- `rights_test.go` gives and takes rights, kicks a habbo that walks out, bans
  it, and takes every right from the navigator.
- `queue_test.go` queues habbos at a full room, lets one in when a place
  frees, puts club members first and takes a spectator until the room empties.
- `walking_test.go` walks two habbos at once, a step every 500 ms, and turns
  one; `game`'s `walking_test.go` tests the way: around walls without cutting
  corners, heights, other habbos and seats.
- Every habbo a test makes has a name of its own across all the test files: the
  tests share one database, where names are unique.
- Tests that need short pings set `game.pingSeconds` and
  `game.pongTimeoutSeconds` for their run.

## Development

Run it through the app runner in `apps/server`:

```sh
cd apps/server
make dev    # air hot reload → http://localhost:15445
```

## Production build

From the repository root:
`go build -o apps/server/tmp/server ./apps/server/cmd/server && ./apps/server/tmp/server`
