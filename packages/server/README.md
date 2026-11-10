# server — Go package

A Go module without a frontend. The app struct (`Server` struct) takes the
database in `New(db)` and registers its routes on a mux in `Mount(mux)`, and
`StartInfo` and `StartMus` start the WebSocket listeners of the client's two
connections; `apps/server` runs it.

## Layout

The game server is laid out as `plans/server/decisions/0005-package-layout.md`
decides. Each part is marked with the task of `plans/server/tasks/index.md`
that brings it. So far the package holds what `tools/create` generated,
`server.go` and `internal/router`, whose `GET /` answers `Hello from Go`, the
listeners of `server.go` and `mus.go`, `transport/`, `encoding/`, `r26/` and
`game/`.

| Part | Holds | Brought by |
| --- | --- | --- |
| `server.go` | `New(db)`, and `StartInfo` and `StartMus`, which start a WebSocket listener on the host and port of `server.info` and of `server.mus` (`plans/server/decisions/0020-info-and-mus-websocket-ports.md`, `plans/server/decisions/0022-start-info-and-start-mus.md`) | s0-03 generated `New(db)` and `Mount(mux)`; s0-07 the listeners |
| `mus.go` | What the `mus` listener does until S7 frames MUS: it logs and never answers (`plans/server/decisions/0023-mus-listener-before-s7.md`) | s0-07 |
| `transport/` | `Conn`, an `io.Reader` to receive, an `io.Writer` to send and an `io.Closer`, over TCP (`tcp.go`) and the WebSocket (`websocket.go`) | s0-05 |
| `encoding/` | B64, VL64 and strings | s0-06 |
| `r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… | s0-07 the framing (`packet.go`), `HELLO` and the dispatch by id (`r26.go`) and the names of hh_entry_init's commands (`entry_init.go`); each cast's handlers with the phase that serves the cast, from S2 |
| `game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them | s2-05 the login and the logout; the other rules with the phases that bring them |

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
   session handles its packets in order. No id has a handler yet.
4. A packet that no handler takes is logged as one line, with the session's
   address, the id, the name when `r26` knows it and the size of the body,
   never the body (`plans/server/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md`):
   `r26 127.0.0.1:53422 unhandled TRY_LOGIN (756), 18 bytes`, or
   `r26 127.0.0.1:53422 unhandled 999, 3 bytes` for an id it does not know.
   `r26` knows the 22 commands of hh_entry_init. The session goes on.
5. The session ends when the client leaves, which is no error and is not
   logged: the client closes, and first writes one byte 0 where a packet would
   start.
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
  the habbo, and saves the machine id, when `s` holds one, and the last time
  online. Then the habbo goes online, and the session it was online on gets
  `ConcurrentLogin`. A ticket that is unknown, spent, or whose CMS session ended
  or moved to another habbo returns `ErrInvalidTicket`.
- `Logout(ctx, db, s, avatarID)` writes the habbo's last time online and takes
  it offline, while `s` plays it. A session that a second login replaced logs
  nothing out.

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

## Development

Run it through the app runner in `apps/server`:

```sh
cd apps/server
make dev    # air hot reload → http://localhost:15445
```

## Production build

From the repository root:
`go build -o apps/server/tmp/server ./apps/server/cmd/server && ./apps/server/tmp/server`
