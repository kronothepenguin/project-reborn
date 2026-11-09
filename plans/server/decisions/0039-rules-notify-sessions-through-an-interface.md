---
type: Decision
title: Rules tell sessions about events through an interface each session implements
description: game defines an interface that each session implements, such as Notify(event), with events as Go structs; a rule finds the habbos concerned in virtual and calls each one's session, and r26's session turns the event into its message.
status: accepted
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
tags: [server, packages]
---

# Decision

- `game` defines an interface that each session implements, with a method such as `Notify(event)`.
- Events are Go structs, such as `game.Chat{From, Text}`.
- A rule finds the habbos an event concerns in `virtual` and calls each one's session; `r26`'s session turns the event
  into its message, such as 24 for chat.

# Context

[0005](/decisions/0005-package-layout.md) keeps the protocol out of `game`. Offered an interface each session
implements, a Go channel per habbo in `virtual`, or events returned to `r26` with a registry of sessions, the user chose
"Session interface (Recommended)": "game defines an interface that each session implements, like Notify(event), and
events are Go structs such as game.Chat{From, Text}. game finds the room's habbos in virtual and calls each one's
session; r26's session turns the event into message 24."

# Consequences

- [s2-05](/tasks/s2-05-login-in-game.md) brings the interface with S2's first event: the old session's logout on a
  second login ([0029](/decisions/0029-a-second-login-closes-the-first.md)).
