---
type: Reference
title: The old server
description: The game server removed in commit 2ea51d7b, where to read it, its structure, what each part did, what this plan changes and the problems found in it.
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, history]
---

# Where it is

| From | Path | Commit |
| --- | --- | --- |
| 2026-01-23 | `server/internal/habbo/` | `a0a7da0e`, the initial commit |
| 2026-02-19 | `server/internal/app/habbo/game/` | `aa35526f` |
| 2026-03-02 | `internal/app/habbo/game/`, later `internal/app/game/` | `7cca2339` |
| 2026-06-22 | `apps/server/` | `19d8f75c` |
| 2026-09-11 | `packages/server/`, removed the same day | moved in `640b0b7d`, removed in `2ea51d7b` |

The last version is the model ([0004](/decisions/0004-old-server-is-the-model.md)):

```sh
git ls-tree -r --name-only 2ea51d7b^ -- packages/server packages/virtual
git show 2ea51d7b^:packages/server/internal/transport/transport.go
```

Its `go.mod` still named the module `.../apps/server`, from before the move.

# Structure

```text
packages/server/
  internal/transport/
    transport.go     Handler func(Connection); Connection = io.ReadWriteCloser + RemoteAddr() string
    tcp.go           TCP.Listen(): accepts and runs the handler in one goroutine per connection
    websocket.go     WebSocket.Mount(mux, pattern), on golang.org/x/net/websocket
  internal/protocol/
    io.go            reading and writing B64 lengths and ids, VL64, strings and booleans
    message.go       Message: a pooled bytes.Buffer with Read and Write helpers
    packet.go        Packet: the command id, the Message and the Session
    pool.go          a sync.Pool of bytes.Buffer
    arguments.go     RawString, String, Int and Bool as io.WriterTo
    registry.go      commands (name -> id, builds outgoing packets) and listeners (id -> handler)
    session.go       Session: the connection, the commands, a logger, the crypto, the hotel and the habbo
    crypto.go        the Diffie-Hellman constants and Habbo's modified RC4
    hh_<cast>/       one package per client cast: Register(registry), name constants and handlers
  pkg/server/
    game.go          Game: a login registry, then a game registry once logged in; Mount(mux) at /client/info;
                     ListenAndServe(addr) for TCP
    registry.go      builds both registries from the hh_ packages
packages/virtual/    Hotel, Habbo, Navigator, FriendList, Settings, Achievement, all with mocked data
```

The `hh_` packages: `hh_buffer`, `hh_cat_code`, `hh_club`, `hh_dynamic_downloader`, `hh_entry_init`,
`hh_friend_list`, `hh_guide`, `hh_ig`, `hh_instant_messenger`, `hh_kiosk_room`, `hh_navigator`, `hh_photo`,
`hh_poll`, `hh_recycler`, `hh_room`, `hh_room_utils`, `hh_shared` and `hh_tutorial`.

# How it worked

1. A transport accepted a connection and called the game's handler with it.
2. The game made a session with the login registry and sent `HELLO`.
3. Each packet was read (3 B64 characters of length, 2 of id), and the listener registered for its id ran. A handler
   read its fields from the message, read or changed `virtual`, and answered with `Session.Send("NAME", args...)`,
   which looked the name up among the commands.
4. Once `SSO` had logged a habbo in, the session switched to the game registry, and the habbo kept the session as its
   `virtual.Connection` so that others could push to it.

# What this plan changes

| Old server | This plan |
| --- | --- |
| `transport.Connection`: `io.ReadWriteCloser` + `RemoteAddr` | The same idea as `transport.Conn`; TCP serves a `net.Listener` ([0006](/decisions/0006-transport.md)) |
| The encoding inside `protocol` | Its own package, `encoding` ([0005](/decisions/0005-package-layout.md)) |
| `protocol/hh_<cast>/` handlers that also held the rules | `r26`, one file per cast, calling the protocol-free rules in `game` ([0005](/decisions/0005-package-layout.md)) |
| `virtual.Connection.Send(cmd string, args ...io.WriterTo)`, with R26 names and values | `game` and `virtual` know no protocol ([0007](/decisions/0007-protocols-per-listener.md)) |
| One protocol | One protocol per listener ([0007](/decisions/0007-protocols-per-listener.md)) |
| `crypto.go` | No encryption ([0012](/decisions/0012-no-encryption.md)) |
| Mocked data | `packages/store`, with hot data in `virtual` ([0009](/decisions/0009-virtual-holds-the-server-state.md), [0010](/decisions/0010-hot-data-written-at-once.md)) |

# Problems found while planning

- The listeners' registry held its mutex while a handler ran, so the handlers of every session ran one at a time.
- Any error from a handler closed the connection, unknown ids included.
- The `/client/mus` WebSocket was never mounted.
- `crypto.go` never worked (commit `21b1accf`, "crypto (not working)"), and the server skipped encryption by answering
  `GENERATEKEY` with `ENDOFCRYPTOPARAMS`.
