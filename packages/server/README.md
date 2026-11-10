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
| `r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… | s0-07 the framing (`packet.go`), `HELLO` and the dispatch by id (`r26.go`) and the names of hh_entry_init's commands (`entry_init.go`); s2-06 the handshake and the login (`entry_init.go`); s2-07 what the client asks after it (`entry_init.go`, `club.go`, `shared.go`); each cast's handlers with the phase that serves the cast |
| `game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them | s2-05 the login and the logout; s2-07 the account, the club status and the sound setting; the other rules with the phases that bring them |

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

`r26` writes a message as 2 B64 characters of its id, the body and the
character 1, in one `Write`, so that the messages of goroutines sharing a
connection never mix. The client ends a message at its first character 1, so a
body that holds one is refused with an error wrapping `encoding.ErrUnencodable`.

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
| `GETAVAILABLEBADGES` (157) | 229: the habbo's badges, and the one it wears in slot 1 |
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
- `New(db)` also loads the navigator's categories, models and public rooms
  into `virtual`. While updates wait, it logs
  `server: the navigator waits for the database updates`, and the first
  reload after they are applied loads it
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
| `GETSPACENODEUSERS` (154) | 223: the names of the habbos in a public room, none until S4 |
| `SUSERF` (16) | 16: the habbo's own rooms, as lines of text; 57 when it has none. The session's habbo is the one listed, whatever name the client sends |
| `SRCHF` (17) | 55: the rooms whose name holds the query or whose owner it names, at most `game.searchMaxRooms`; 58 when none matches |
| `GET_RECOMMENDED_ROOMS` (264) | 351: three habbo rooms drawn at random (`plans/server/decisions/0057-three-random-recommended-rooms.md`) |

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
  the session it was online on gets `ConcurrentLogin`. A ticket that is unknown, spent, or whose CMS session ended
  or moved to another habbo returns `ErrInvalidTicket`.
- `Logout(ctx, db, s, avatarID)` writes the habbo's last time online and takes
  it offline, while `s` plays it. A session that a second login replaced logs
  nothing out.
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
