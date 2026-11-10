---
type: Task
title: Send through an outbox per session
description: Each r26 session queues its messages and a goroutine of its own writes them; a client whose game.outboxSize queue is full is closed.
status: todo
phase: s4
depends_on: []
packages: [packages/server, packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-10T17:09:06+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:09:06+00:00"}
---

# Goal

Sending never waits for a client ([0073](/decisions/0073-each-session-sends-through-an-outbox.md)).

# Steps

- [ ] The setting `game.outboxSize`, 500, in the catalogue and housekeeping's Game form.
- [ ] Each r26 session queues what it sends, and a goroutine of its own writes the queue in order until the session
  ends; a session whose queue is full is closed and logged.
- [ ] Tests: the messages keep their order, a client that stops reading is closed while the others carry on, and the
  ping loop still works.

# Verification

```sh
cd packages/server && go test ./... -race
cd packages/virtual && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-outbox`.
- Found while designing [s4-02](/tasks/s4-02-loaded-rooms.md): a session wrote straight to its connection.
