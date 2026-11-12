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
| `packages/server` | `New(db)`, which loads the settings and reloads them, and `StartInfo` and `StartMus`, which start a WebSocket listener on the host and port of `server.info` and of `server.mus` | [0002](/decisions/0002-server-app.md), [0005](/decisions/0005-package-layout.md), [0020](/decisions/0020-info-and-mus-websocket-ports.md), [0022](/decisions/0022-start-info-and-start-mus.md), [0023](/decisions/0023-mus-listener-before-s7.md), [0050](/decisions/0050-the-server-loads-and-reloads-the-settings.md) |
| `packages/server/transport` | `Conn` (receive, send, close), TCP and the WebSocket on `golang.org/x/net/websocket` | [0006](/decisions/0006-transport.md) |
| `packages/server/encoding` | B64, VL64 and strings, shared by every protocol | [0005](/decisions/0005-package-layout.md) |
| `packages/server/r26` | The R26 ids, framing and handshake, the dispatch by id, and one file per client cast | [0007](/decisions/0007-protocols-per-listener.md), [0012](/decisions/0012-no-encryption.md), [0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md), [0027](/decisions/0027-endofcryptoparams-right-after-cryptoparameters.md), [0028](/decisions/0028-sso-only.md), [0049](/decisions/0049-a-wrong-version-is-closed.md) |
| `packages/server/game` | The rules of the hotel, with no protocol in them, and the events they send sessions | [0005](/decisions/0005-package-layout.md), [0039](/decisions/0039-rules-notify-sessions-through-an-interface.md), [0048](/decisions/0048-sessions-through-an-interface-virtual-declares.md) |
| `packages/virtual` | The state: hot data and temporary data, one package per entity | [0009](/decisions/0009-virtual-holds-the-server-state.md) |
| `packages/virtual/habbo` | The habbos online in the game, each with its session | [0047](/decisions/0047-online-habbos-in-virtual-habbo.md), [0048](/decisions/0048-sessions-through-an-interface-virtual-declares.md) |
| `packages/virtual/category`, `model` and `room` | The navigator's categories, the room models and the public rooms, loaded at start; the loaded rooms, with their floors, habbos, rights, bans, lines, events and kept places, and the way each habbo heads into a room | [0060](/decisions/0060-virtual-category-model-and-room.md), [0064](/decisions/0064-the-navigator-loads-once-the-updates-are-applied.md), [0069](/decisions/0069-doorbell-queue-and-spectators-in-memory.md), [0071](/decisions/0071-an-empty-room-unloads-at-once.md) |
| `packages/store` | The database: tables, queries and updates | [0010](/decisions/0010-hot-data-written-at-once.md), [0011](/decisions/0011-saved-and-memory-only-data.md) |
| `apps/server` | The runner | [0002](/decisions/0002-server-app.md) |

`game` never imports `r26`, so a second protocol needs no change to the rules.

So far `packages/server` holds the listeners, `transport`, `encoding`, `r26`, which takes a client from `HELLO` to
`LOGIN_OK` ([s2-06](/tasks/s2-06-handshake-and-login.md)), answers what it asks after
([s2-07](/tasks/s2-07-after-login.md)) and serves the navigator and the room-o-matic ([S3](/phases/s3-navigator.md)),
and `game`, whose rules log a habbo in and out ([s2-05](/tasks/s2-05-login-in-game.md)) and list, create, change and
delete rooms. A session that ends logs its habbo out. `server.New` loads the navigator's shared data into
`virtual/category`, `virtual/model` and `virtual/room` ([s3-02](/tasks/s3-02-navigator-state.md)), and prunes the chat
history every hour ([0084](/decisions/0084-the-game-server-prunes-the-chat-hourly.md)).

[S4](/phases/s4-rooms.md) brought the rooms: `r26/room.go` and `r26/room_utils.go` serve hh_room's entry, walking,
chat, rights, ratings, events, badges, groups, the queue and the spectators, through `game`'s rules on the loaded rooms
of `virtual/room`. A room loads with its first habbo and unloads with its last
([0071](/decisions/0071-an-empty-room-unloads-at-once.md)); while loaded, a goroutine of `game`, its clock, ticks every
500 ms, walking its habbos, ending timed statuses and sending what changed in one message
([0065](/decisions/0065-walking-500-ms-by-holos-rules.md), [0072](/decisions/0072-each-loaded-room-runs-its-own-clock.md)).

[S5](/phases/s5-furni-catalogue.md) brought the furni: `r26/cat_code.go`, `r26/room_hand.go`, `r26/room_furni.go` and
`r26/recycler.go` serve the catalogue, the hand, the furni of a room, trades and the recycler. `server.New` loads the
furni definitions and the catalogue into `virtual/furni` and `virtual/catalogue`
([0098](/decisions/0098-virtual-furni-and-catalogue.md)). A piece of furni lives in the store, where the hand is read
each time ([0096](/decisions/0096-the-hand-is-read-from-the-database.md)); a loaded room keeps a copy of what stands in
it, changed after the store is ([0010](/decisions/0010-hot-data-written-at-once.md)), and its clock rolls its rollers
every 2 seconds ([0107](/decisions/0107-rollers-roll-every-two-seconds.md)). An open trade lives in the loaded room and
nowhere else ([0092](/decisions/0092-a-trade-lives-only-in-memory.md)); a recycling lives in the store alone
([0093](/decisions/0093-a-recycling-is-saved.md)). `virtual/furni` also creates the pieces of a furni for whoever gives
one, the catalogue or the site ([0125](/decisions/0125-an-item-voucher-gives-what-buying-gives.md)).

# A connection

1. A listener, the WebSocket listener on the host and port that `config.json` gives `info` or `mus`, accepts a client
   and hands its `Conn` to the protocol of its connection, in a goroutine of the connection's own: r26 on `info`
   ([0020](/decisions/0020-info-and-mus-websocket-ports.md)).
2. The protocol (`r26`) sends `HELLO`, reads packets one after another, and runs the handler of the cast that owns each
   id. A packet that no handler takes is logged by its id, its name and its size, never its body, and the session goes
   on ([0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md)).
3. The handler reads the fields and calls a rule in `game`.
4. The rule reads and changes the state in `virtual`. Saved data is written to the database at once, then in memory.
5. The protocol queues the answers in the session's outbox, which a goroutine of the session's own writes on the
   `Conn` in order, so that sending never waits for a client; a client that stops reading fills its outbox and is
   closed ([0073](/decisions/0073-each-session-sends-through-an-outbox.md)).

A rule tells the habbos an event concerns, such as everyone in a room when one habbo talks, without knowing their
protocol: it finds them in `virtual/habbo` and calls each one's `Session.Notify` with one of `game`'s events, which the
session's protocol turns into its messages ([0039](/decisions/0039-rules-notify-sessions-through-an-interface.md),
[0048](/decisions/0048-sessions-through-an-interface-virtual-declares.md)).

Until [S7](/phases/s7-club-help-extras.md) frames MUS, the `mus` listener accepts the WebSocket, logs the connect, the
size of each message and the close, and never answers ([0023](/decisions/0023-mus-listener-before-s7.md)).

# Running alone

`apps/server` runs the server on its own, as each program runs today: it opens the database named by `config.json`
and starts the WebSocket listener of each connection, on its host and port, with `StartInfo` and `StartMus`
([0020](/decisions/0020-info-and-mus-websocket-ports.md), [0022](/decisions/0022-start-info-and-start-mus.md)).

# Running together

Under the orchestrator (`plans/later.md`), one process runs the installer, the CMS, housekeeping and the server. The
server keeps a WebSocket listener on the host and port of each connection, which the orchestrator starts with the
same `StartInfo` and `StartMus` ([0022](/decisions/0022-start-info-and-start-mus.md)), and WebSocket paths on the
orchestrator's mux wait for later, as TCP does ([0020](/decisions/0020-info-and-mus-websocket-ports.md)). The CMS and
housekeeping change the virtual state directly ([0013](/decisions/0013-site-changes-like-mus.md)).

# Another protocol

r18 would be `packages/server/r18` and one more listener ([0007](/decisions/0007-protocols-per-listener.md)). Whether
its players share the hotel with r26 players, with one state and every event written by each player's protocol, or get
a hotel of their own, is settled when it starts.
