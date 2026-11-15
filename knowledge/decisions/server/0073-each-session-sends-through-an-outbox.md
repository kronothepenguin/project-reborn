---
type: Decision
title: Each session sends through an outbox
description: A session queues its outgoing messages, which a goroutine of its own writes, so sending never waits; a client whose queue is full has stopped reading and is closed; the queue holds game.outboxSize messages, 500.
status: accepted
timestamp: 2026-11-10T17:09:06+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T17:09:06+00:00"}
tags: [server, sessions, transport]
---

# Decision

- Each session queues its outgoing messages, and a goroutine of its own writes them in order, so sending only adds to
  the queue and never waits for the client.
- A client whose queue is full has stopped reading, and is closed.
- The queue holds `game.outboxSize` messages, a setting, 500 by default.

# Context

A session wrote each message straight to its connection and waited while the connection was full. In a room, one
habbo's chat or step goes to every client in it, so a client that stops reading would hold up everyone who writes to
it. Offered an outbox per session, a write time limit, or writing as before, the user chose "An outbox per session
(Recommended)": "Each session gets a queue of outgoing messages, written by a goroutine of its own, so sending only adds
to the queue and never waits. A client whose queue fills up has stopped reading and is closed. The queue's size is a
setting, like the ping settings. Example: with a queue of 500, a frozen client is closed after 500 waiting messages,
and its room keeps walking and chatting meanwhile."

# Consequences

- s4-10 applies it, before s4-03 sends to rooms.
