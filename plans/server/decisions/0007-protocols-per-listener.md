---
type: Decision
title: r26 is the protocol package, and each listener names its protocol
description: The R26 protocol is a Go package named r26, each TCP address or WebSocket path names the protocol it speaks, r18 stays a door left open, and whether r18 and r26 players share one hotel is documented both ways.
status: superseded
superseded_by: "0019"
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, protocol, architecture]
---

# Decision

- The R26 protocol is a Go package named `r26`, `packages/server/r26` ([0005](/decisions/0005-package-layout.md)).
- Each listener, a TCP address or a WebSocket path, names the protocol it speaks: TCP `:30000` speaks `r26`, and later
  TCP `:30001` could speak `r18`. The version cannot be guessed from the client's bytes, because the server speaks
  first (`HELLO`).
- r18 is not built in this plan. The door stays open: r18 would be a new package and one listener entry, with no change
  to the game rules. The repository has no r18 client to reverse engineer.
- Whether r18 and r26 players share one hotel is documented both ways, and settled when r18 starts:
  - one shared hotel: one state, and every game event is written by each player's protocol in its own format (an r26
    habbo says "hi" in room 5, the game tells everyone in room 5, and r26 and r18 each send their own message);
  - one hotel per protocol: each protocol serves its own hotel.
- The work focuses on r26.

# Context

The user: "create a package for the protocol and explicity call it r26" and "create a way out for the server to have
dynamic protocol, this means i can change between r26 and r18 or support both at the same time".

Asked whether r26 and r18 players share one hotel, they answered: "both, we can document it and just focus on r26 for
now". Offered the door open only, an r18 phase after r26, or both from the start, they chose the door open only. The
example ports are illustrations, not chosen ports.

# Consequences

- `game` never imports `r26`, so either way stays possible ([0005](/decisions/0005-package-layout.md)).
- The listeners are declared in `config.json`, whose keys are startup keys ([s0-04](/tasks/s0-04-listener-config.md)).
- `plans/later.md` lists r18.
