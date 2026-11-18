---
type: Reference
title: How the server is built
description: The packages of the game server and what each one does, the path of a connection from a listener to the state, and how the server runs alone and under the orchestrator.
timestamp: 2026-11-10T21:11:34+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, architecture]
---

# Packages

| Package | Holds | Decisions |
| --- | --- | --- |
| `packages/server` | `New(db, opts...)`, which loads what every player shares once no update waits and, with `WithAPI()`, opens the `/api/` listener, `StartInfo` and `StartMus`, which start a WebSocket listener on the host and port of `server.info` and of `server.mus`, and `SendLook`, the game's side of `services.Habbos` | 0002 (`knowledge/decisions/server/0002-server-app.md`), 0005 (`knowledge/decisions/server/0005-package-layout.md`), 0020 (`knowledge/decisions/server/0020-info-and-mus-websocket-ports.md`), 0022 (`knowledge/decisions/server/0022-start-info-and-start-mus.md`), 0023 (`knowledge/decisions/server/0023-mus-listener-before-s7.md`), reborn 0006 (`knowledge/decisions/reborn/0006-settings-are-read-from-the-store.md`) |
| `packages/server/api` | The client of the game's `/api/`: `api.New(baseURL, db)` implements `services.Habbos` for the programs run apart, and gives up after 2 seconds | reborn/0005 (`knowledge/decisions/reborn/0005-the-game-hears-live-changes-through-services.md`) |
| `packages/server/internal/router` | The handlers of the game's `/api/` and the check of `X-Reborn-Secret` | reborn/0005 (`knowledge/decisions/reborn/0005-the-game-hears-live-changes-through-services.md`) |
| `packages/server/internal/transport` | `Conn` (receive, send, close), TCP and the WebSocket on `golang.org/x/net/websocket` | 0006 (`knowledge/decisions/server/0006-transport.md`) |
| `packages/server/internal/encoding` | B64, VL64 and strings, shared by every protocol | 0005 (`knowledge/decisions/server/0005-package-layout.md`) |
| `packages/server/internal/r26` | The R26 ids, framing and handshake, the dispatch by id, and one file per client cast | 0007 (`knowledge/decisions/server/0007-protocols-per-listener.md`), 0012 (`knowledge/decisions/server/0012-no-encryption.md`), 0021 (`knowledge/decisions/server/0021-unhandled-packets-logged-by-id-name-and-size.md`), 0027 (`knowledge/decisions/server/0027-endofcryptoparams-right-after-cryptoparameters.md`), 0028 (`knowledge/decisions/server/0028-sso-only.md`), 0049 (`knowledge/decisions/server/0049-a-wrong-version-is-closed.md`) |
| `packages/server/internal/game` | The rules of the hotel, with no protocol in them, and the events they send sessions | 0005 (`knowledge/decisions/server/0005-package-layout.md`), 0039 (`knowledge/decisions/server/0039-rules-notify-sessions-through-an-interface.md`), 0048 (`knowledge/decisions/server/0048-sessions-through-an-interface-virtual-declares.md`) |
| `packages/virtual` | The state: hot data and temporary data, one package per entity | 0009 (`knowledge/decisions/server/0009-virtual-holds-the-server-state.md`) |
| `packages/virtual/habbo` | The habbos online in the game, each with its session | 0047 (`knowledge/decisions/server/0047-online-habbos-in-virtual-habbo.md`), 0048 (`knowledge/decisions/server/0048-sessions-through-an-interface-virtual-declares.md`) |
| `packages/virtual/category`, `model` and `room` | The navigator's categories, the room models and the public rooms, loaded at start; the loaded rooms, with their floors, habbos, rights, bans, lines, events and kept places, and the way each habbo heads into a room | 0060 (`knowledge/decisions/server/0060-virtual-category-model-and-room.md`), 0064 (`knowledge/decisions/server/0064-the-navigator-loads-once-the-updates-are-applied.md`), 0069 (`knowledge/decisions/server/0069-doorbell-queue-and-spectators-in-memory.md`), 0071 (`knowledge/decisions/server/0071-an-empty-room-unloads-at-once.md`) |
| `packages/store` | The database: tables, queries and updates | 0010 (`knowledge/decisions/server/0010-hot-data-written-at-once.md`), 0011 (`knowledge/decisions/server/0011-saved-and-memory-only-data.md`) |
| `apps/server` | The runner | 0002 (`knowledge/decisions/server/0002-server-app.md`) |

`game` never imports `r26`, so a second protocol needs no change to the rules.

So far `packages/server` holds the listeners, `transport`, `encoding`, `r26`, which takes a client from `HELLO` to
`LOGIN_OK` (s2-06), answers what it asks after
(s2-07) and serves the navigator and the room-o-matic (S3),
and `game`, whose rules log a habbo in and out (s2-05) and list, create, change and
delete rooms. A session that ends logs its habbo out. `server.New` loads the navigator's shared data into
`virtual/category`, `virtual/model` and `virtual/room` (s3-02), and prunes the chat
history every hour (0084 (`knowledge/decisions/server/0084-the-game-server-prunes-the-chat-hourly.md`)) and deletes the
ended room bans every minute.

S4 brought the rooms: `internal/r26/room.go` and `internal/r26/room_utils.go` serve hh_room's entry, walking,
chat, rights, ratings, events, badges, groups, the queue and the spectators, through `game`'s rules on the loaded rooms
of `virtual/room`. A room loads with its first habbo and unloads with its last
(0071 (`knowledge/decisions/server/0071-an-empty-room-unloads-at-once.md`)); while loaded, a goroutine of `game`, its clock, ticks every
500 ms, walking its habbos, ending timed statuses and sending what changed in one message
(0065 (`knowledge/decisions/server/0065-walking-500-ms-by-holos-rules.md`), 0072 (`knowledge/decisions/server/0072-each-loaded-room-runs-its-own-clock.md`)).

S5 brought the furni: `internal/r26/cat_code.go`, `internal/r26/room_hand.go`, `internal/r26/room_furni.go` and
`internal/r26/recycler.go` serve the catalogue, the hand, the furni of a room, trades and the recycler. `server.New` loads the
furni definitions and the catalogue into `virtual/furni` and `virtual/catalogue`
(0098 (`knowledge/decisions/server/0098-virtual-furni-and-catalogue.md`)). A piece of furni lives in the store, where the hand is read
each time (0096 (`knowledge/decisions/server/0096-the-hand-is-read-from-the-database.md`)); a loaded room keeps a copy of what stands in
it, changed after the store is (0010 (`knowledge/decisions/server/0010-hot-data-written-at-once.md`)), and its clock rolls its rollers
every 2 seconds (0107 (`knowledge/decisions/server/0107-rollers-roll-every-two-seconds.md`)). An open trade lives in the loaded room and
nowhere else (0092 (`knowledge/decisions/server/0092-a-trade-lives-only-in-memory.md`)); a recycling lives in the store alone
(0093 (`knowledge/decisions/server/0093-a-recycling-is-saved.md`)). `virtual/furni` also creates the pieces of a furni for whoever gives
one, the catalogue or the site (0125 (`knowledge/decisions/server/0125-an-item-voucher-gives-what-buying-gives.md`)).

# A connection

1. A listener, the WebSocket listener on the host and port that `config.json` gives `info` or `mus`, accepts a client
   and hands its `Conn` to the protocol of its connection, in a goroutine of the connection's own: r26 on `info`
   (0020 (`knowledge/decisions/server/0020-info-and-mus-websocket-ports.md`)).
2. The protocol (`r26`) sends `HELLO`, reads packets one after another, and runs the handler of the cast that owns each
   id. A packet that no handler takes is logged by its id, its name and its size, never its body, and the session goes
   on (0021 (`knowledge/decisions/server/0021-unhandled-packets-logged-by-id-name-and-size.md`)).
3. The handler reads the fields and calls a rule in `game`.
   `game` logs a login (`game: habbo <id> <name> logged in`) and a room entry (`game: habbo <id> <name> entered
   public room|habbo room <id> <name>`), one `Info` line each, with ids and names only.
4. The rule reads and changes the state in `virtual`. Saved data is written to the database at once, then in memory.
5. The protocol queues the answers in the session's outbox, which a goroutine of the session's own writes on the
   `Conn` in order, so that sending never waits for a client; a client that stops reading fills its outbox and is
   closed (0073 (`knowledge/decisions/server/0073-each-session-sends-through-an-outbox.md`)).

A rule tells the habbos an event concerns, such as everyone in a room when one habbo talks, without knowing their
protocol: it finds them in `virtual/habbo` and calls each one's `Session.Notify` with one of `game`'s events, which the
session's protocol turns into its messages (0039 (`knowledge/decisions/server/0039-rules-notify-sessions-through-an-interface.md`),
0048 (`knowledge/decisions/server/0048-sessions-through-an-interface-virtual-declares.md`)).

The steps in detail, the `mus` listener and the outbox: [A connection](/connection.md).

# Running alone

`apps/server` runs the server on its own, as each program runs today: it opens the database named by `config.json`
and starts the WebSocket listener of each connection, on its host and port, with `StartInfo` and `StartMus`
(0020 (`knowledge/decisions/server/0020-info-and-mus-websocket-ports.md`), 0022 (`knowledge/decisions/server/0022-start-info-and-start-mus.md`)).

It passes `WithAPI()`, so `New` also opens an HTTP listener on `server.api` (default `localhost:15445`) that serves the
game's `/api/` (reborn/0005 (`knowledge/decisions/reborn/0005-the-game-hears-live-changes-through-services.md`)):

| Route | Does |
| --- | --- |
| `POST /api/habbos/{id}/look` | Calls `SendLook` for the habbo and answers 204 |

- Every request carries the hotel's secret, the one row of `api_secret`, in the header `X-Reborn-Secret`. A missing or
  wrong secret, and every other path or method, is answered 404.
- The game reads the secret on each request, so a hotel whose update `0025-api-secret.sql` waits answers 404 until it
  is applied.
- The CMS's and housekeeping's runners `Inject` `api.New` built from `server.api` and their database. The client reads
  the secret on each call, so a secret created or changed while they run is used on the next call. Without the secret a
  call returns an error, which the caller logs.

In development, `make dev` runs air, which watches the `.go` files of `apps/server`, `packages/server`,
`packages/config` and `packages/store` (`apps/server/.air.toml`) and rebuilds the runner on each change.

# Running together

Under the orchestrator (`knowledge/features/platform/later.md`), one process runs the installer, the CMS, housekeeping and the server. The
server keeps a WebSocket listener on the host and port of each connection, which the orchestrator starts with the
same `StartInfo` and `StartMus` (0022 (`knowledge/decisions/server/0022-start-info-and-start-mus.md`)), and WebSocket paths on the
orchestrator's mux wait for later, as TCP does (0020 (`knowledge/decisions/server/0020-info-and-mus-websocket-ports.md`)). The CMS and
housekeeping tell the game of a change through `services.Habbos`, which the game server itself implements in the same
process; reborn opens no `/api/` (reborn/0005 (`knowledge/decisions/reborn/0005-the-game-hears-live-changes-through-services.md`)).

# Another protocol

r18 would be `packages/server/r18` and one more listener (0007 (`knowledge/decisions/server/0007-protocols-per-listener.md`)). Whether
its players share the hotel with r26 players, with one state and every event written by each player's protocol, or get
a hotel of their own, is settled when it starts.
