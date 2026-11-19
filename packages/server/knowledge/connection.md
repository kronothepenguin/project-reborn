---
type: Reference
title: A connection
description: How the info and mus listeners serve a client, from HELLO through the dispatch by id and the outbox to the close.
tags: [server]
---

# The doors

`Start(ctx)` opens the game's doors: a WebSocket listener on the host and port
that `config.json` gives `server.info`, and one on `server.mus`. It logs where
each listens, `server: info on ws://localhost:30000`, serves them in the
background, and returns an error when it cannot listen. Both runners call it,
`apps/server` and reborn (`knowledge/features/hotel-status/plan.md`).

- The doors open while `game.closed` and `site.maintenance` are both false.
  Otherwise `Start` logs `server: the hotel is closed, and its doors stay
  closed` and returns nil; the program and its `/api/` keep running.
- `Start` with the doors open does nothing.
- `Stop(ctx)` closes both listeners, so a client that dials is refused. Each
  session of `info` gets 292 with the opening time 00:00 and the disconnect
  flag, `HHI`, and its habbo is logged out at once by `game.Logout`, with its
  last time online saved. The client draws the notice only while its
  connection is open, so the connection stays open 5 seconds after 292
  (`noticeHold`), and the session handles no packet meanwhile; then it closes,
  and the client's window goes to the site. Each `mus` connection closes at
  once. The sessions hold together, so `Stop` takes about 5 seconds while
  anybody is connected, and returns at once when nobody is. `Stop` waits for
  every session until `ctx` ends, then returns `ctx`'s cause, and logs
  `server: the doors are closed`. With the doors closed, it does nothing.
- The `/api/` client's `Stop` gives up after 15 seconds, its other calls after
  2.
- A session's handlers and the closing of the hotel each hold the session's
  mutex, so the logout never runs beside a handler.
- `http.Server.Close` leaves the hijacked WebSockets open, so each session
  watches a context of the doors, which `Stop` ends.
- `Status` reads whether the doors are open and `habbo.Count()`; `AreOnline`
  reads `habbo.Get` for each id, and `Online` reads `habbo.IDs()`.

# A session

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
   handlers ([The handshake and the login](/handshake-and-login.md)). A
   handler that closes the session leaves the packets after it unread.
4. A packet that no handler takes is logged as one line, with the session's
   address, the id, the name when `r26` knows it and the size of the body,
   never the body (`knowledge/decisions/server/0021-unhandled-packets-logged-by-id-name-and-size.md`):
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
(`knowledge/decisions/server/0073-each-session-sends-through-an-outbox.md`):

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
(`knowledge/decisions/server/0023-mus-listener-before-s7.md`):
`mus 127.0.0.1:53422 connected`, `mus 127.0.0.1:53422 received 11 bytes` and
`mus 127.0.0.1:53422 closed`. The transport hides the WebSocket's frames, so a
size is what one read brings: never more than one message, and a large message
may come in several reads.

- The server logs through the default logger of `log/slog`.
- A panic in a session does not end the server: `net/http` recovers it and logs
  it, and the transport closes that connection. Over TCP, which no listener
  serves yet, it would end the process.
