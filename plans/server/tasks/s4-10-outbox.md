---
type: Task
title: Send through an outbox per session
description: Each r26 session queues its messages and a goroutine of its own writes them; a client whose game.outboxSize queue is full is closed.
status: done
phase: s4
depends_on: []
packages: [packages/server, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T17:22:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:09:06+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:22:46+00:00"}
---

# Goal

Sending never waits for a client ([0073](/decisions/0073-each-session-sends-through-an-outbox.md)).

# Steps

- [x] The setting `game.outboxSize`, 500, in the catalogue and housekeeping's Game form.
- [x] Each r26 session queues what it sends, and a goroutine of its own writes the queue in order until the session
  ends; a session whose queue is full is closed and logged.
- [x] Tests: the messages keep their order, a client that stops reading is closed while the others carry on, and the
  ping loop still works.

# Verification

```sh
cd packages/server && go test ./... -race
cd packages/virtual && go test ./... -race
make gates
```

Results:

- The setting `game.outboxSize`, 500, from 10 to 100000, is in the catalogue and housekeeping's Game form.
- Each r26 session queues what it sends in a channel of `game.outboxSize` messages, read as the session starts, and a
  goroutine of its own writes the queue in order, one message per `Write`
  ([0073](/decisions/0073-each-session-sends-through-an-outbox.md)). `send` fails only for a message the protocol
  cannot carry: `writePacket` became `encodePacket`, which frames a message without writing it.
- A full queue ends the session at once and logs it once, `r26 <addr> closed: 500 messages waiting`. A session the
  server ends (`end`: a wrong `VERSIONCHECK`, a second login, a database failure) writes what it sent before, then
  closes; the ping loop's timeout (`abort`) closes at once. The ping loop runs until the writer is done, so its timeout
  still ends a session whose last messages wait on a client that stopped reading. Once a session has ended, what is
  sent to it goes nowhere.
- In `packages/server`, `go vet ./...` and `go test ./... -race` pass, with `TestTheOutboxKeepsTheOrderOfTheMessages`,
  `TestAClientThatStopsReadingIsClosed`, where another session's handler sends 600 messages to a client that does not
  read and goes on, `TestEndWritesWhatWasSentBefore` and the `encodePacket` tests; the ping, version and second-login
  tests pass three times in separate runs, and the new r26 tests 20 times. `packages/virtual`'s settings and
  housekeeping's Game form tests pass.

# Notes

- Runs on the branch `s4-outbox`.
- Found while designing [s4-02](/tasks/s4-02-loaded-rooms.md): a session wrote straight to its connection.
