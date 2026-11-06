# server — Go package

A Go module without a frontend. The app struct (`Server` struct) takes the
database in `New(db)` and registers its routes on a mux in `Mount(mux)`;
`apps/server` runs it.

## Layout

The game server is laid out as `plans/server/decisions/0005-package-layout.md`
decides. Each part is marked with the task of `plans/server/tasks/index.md`
that brings it. So far the package holds what `tools/create` generated,
`server.go` and `internal/router`, whose `GET /` answers `Hello from Go`,
`transport/` and `encoding/`.

| Part | Holds | Brought by |
| --- | --- | --- |
| `server.go` | `New(db)`, and a WebSocket listener on the host and port of `server.info` and of `server.mus` (`plans/server/decisions/0020-info-and-mus-websocket-ports.md`) | s0-03 generated `New(db)` and `Mount(mux)`; s0-07 serves the listeners |
| `transport/` | `Conn`, an `io.Reader` to receive, an `io.Writer` to send and an `io.Closer`, over TCP (`tcp.go`) and the WebSocket (`websocket.go`) | s0-05 |
| `encoding/` | B64, VL64 and strings | s0-06 |
| `r26/` | The R26 ids, and one file per client cast: `entry_init.go`, `navigator.go`, `room.go`… | s0-07 the framing, `HELLO` and the dispatch by id; each cast's handlers with the phase that serves the cast, from S2 |
| `game/` | The rules: login, entering rooms, chat, walking…, with no protocol in them | S2, the first rules; its tasks are written when the phase starts |

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

## Port

- App (Go HTTP server): **15445** — baked in `apps/server/cmd/server`

## Development

Run it through the app runner in `apps/server`:

```sh
cd apps/server
make dev    # air hot reload → http://localhost:15445
```

## Production build

From the repository root:
`go build -o apps/server/tmp/server ./apps/server/cmd/server && ./apps/server/tmp/server`
