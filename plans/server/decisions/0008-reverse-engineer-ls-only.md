---
type: Decision
title: The R26 protocol comes from the client's .ls scripts
description: The protocol is reverse engineered from the Lingo .ls scripts of packages/client-r26/src/game, never from the .js translations, covering every Handler Class and every other script that registers or sends messages.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [protocol, client]
---

# Decision

- The source of the protocol is `packages/client-r26/src/game/**/*.ls`. The `.js` files beside them are ignored.
- A cast's Handler Class registers the messages the client receives (`tMsgs`: id → handler) and the commands it sends
  (`tCmds`: name → id). Other scripts register some too, and the commands are sent from scripts all over the client,
  `hh_furni_classes` and `hh_room_ui` among them, which register nothing: the reference covers all of them
  ([The R26 client](/reference/client-r26.md)).
- The results are reference documents in this bundle, one per cast, written in
  [S1](/phases/s1-protocol-reference.md).

# Context

The user: "do reverse engineering of @packages/client-r26/src/game/ . look for .ls and ignore .js" and "every under
@packages/client-r26/src/game/ could have a "Handler Class.ls" that is the one with the protocol".

While planning, 23 Handler Classes were found in 20 casts, plus the other registering scripts. 295 of the 414 `.ls`
files end their lines with CR alone ([the rules](/rules.md#reading-the-client)).

# Consequences

- Every phase from S2 on implements from the S1 documents.
