---
type: Decision
title: An online habbo keeps its session through an interface virtual declares
description: virtual/habbo declares the Session interface, Notify(event any), and keeps each online habbo with its session; game.Session is that same interface and the events are game's structs.
status: accepted
timestamp: 2026-11-10T02:09:39+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:09:39+00:00"}
tags: [server, virtual, game]
---

# Decision

- `virtual/habbo` declares `type Session interface { Notify(event any) }` and keeps each online habbo with its
  session.
- `game.Session` is that same interface, and the events are `game`'s structs, such as `game.ConcurrentLogin{}`, which
  `r26` turns into 287 with reason 2 ([0029](/decisions/0029-a-second-login-closes-the-first.md)).

# Context

[0039](/decisions/0039-rules-notify-sessions-through-an-interface.md) has a rule find the habbos an event concerns in
`virtual` and call each one's session, but `game` imports `virtual`, so `virtual` cannot name a type of `game`. Offered
an interface declared in `virtual`, or the sessions kept in `game` beside `virtual`'s habbos, the user chose "Interface
in virtual (Recommended)": "virtual/habbos declares `type Session interface { Notify(event any) }` and keeps each online
habbo with its session; game.Session is that same interface and the events are game structs. Example:
h.Session.Notify(game.ConcurrentLogin{}), which r26 turns into 287 with reason 2."

# Consequences

- [s2-05](/tasks/s2-05-login-in-game.md) declares it, in `virtual/habbo` ([0047](/decisions/0047-online-habbos-in-virtual-habbo.md)).
