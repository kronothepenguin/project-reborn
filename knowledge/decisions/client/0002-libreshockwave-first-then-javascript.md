---
type: Decision
title: LibreShockwave and the .dcr first, a vanilla JavaScript client later
description: The CMS's client page first runs the R26 .dcr in the browser on LibreShockwave, and later a vanilla JavaScript client takes the place of LibreShockwave and the .dcr.
status: accepted
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [client]
---

# Decision

- First, the CMS's client page runs the R26 `.dcr` in the browser on LibreShockwave.
- Later, a vanilla JavaScript client takes the place of LibreShockwave and the `.dcr`.

# Context

The user: "in my idea i want to use libreshockwave to serve dcr for now in the cms client [...] first i will use
libreshockwave + dcr, later i plan to remake dcr into vanilla js."

`knowledge/decisions/server/0015-client-on-libreshockwave.md` already runs the client on LibreShockwave for the game
server's sake, so that every socket of the client is a WebSocket.

# Consequences

- C1 builds the page on LibreShockwave, and
  C3 puts the JavaScript client in its place.
- How the JavaScript client relates to `packages/client-r26` and `packages/director`, the translation and the Director
  runtime the repository already holds, is a question of C3.
