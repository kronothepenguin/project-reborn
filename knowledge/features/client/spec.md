---
type: Spec
title: The client in the browser
description: A signed-in habbo opens the site's client page, where the R26 client runs on LibreShockwave; one program serves the client's files; and later the client runs in vanilla JavaScript.
status: active
projects: [packages/cms, packages/housekeeping, packages/settings, packages/virtual, vendor/LibreShockwave]
---

# What

The R26 client reaches the player's browser. It was the client bundle's phases C1 to C3, in their order: the `.dcr` on
LibreShockwave in the site's client page; one program for the client's files, with the external texts and variables
edited in housekeeping; and a client in vanilla JavaScript
([client 0002](/decisions/client/0002-libreshockwave-first-then-javascript.md)).

The client page comes first, for [the habbos feature](/features/habbos/spec.md)
([0012](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)).

# Behaviours

For the client page:

- A signed-in habbo opens the site's client page, and the R26 client runs there on LibreShockwave's player and logs in
  to the game server with the page's SSO ticket.
- A client connects over TCP or a WebSocket: bytes travel both ways, text frames carry their bytes, and a close on
  either side ends the session.
- A WebSocket without an Origin header connects: it is refused.
- The player is built from `vendor/LibreShockwave` by a make target, into a folder git ignores.

The client's files and the JavaScript client get theirs when they start.

# Open questions

- The client's files and the JavaScript client keep the open questions of their phases: six for the client's files,
  four for the JavaScript client.

The client's files:

- Whether it is a new project, a package and a runner made with `tools/create`, or a part of an existing one, and its
  name.
- Where the external folder is set, and what it may hold: the `.dcr`, its `.cct` casts, and whatever else the client
  loads, such as the figure data.
- Where housekeeping keeps the texts and the variables, in the database or as files in the folder, and what fills them
  the first time.
- Which housekeeping attribute lets someone edit them.
- How it runs alone and under the orchestrator, beside the other programs.
- Whether the binary embeds a default set of files, or serves only what the folder holds.

The JavaScript client:

- How it relates to `packages/client-r26` and `packages/director`, the translation of the client's scripts and the
  Director runtime the repository holds: whether it carries them on or starts again.
- Which source it is made from: the recent decompile of the client bundle's phase C1, or the `.ls` scripts of
  `packages/client-r26/src/game/`.
- What "vanilla" rules out: frameworks, a build step, or both.
- Whether the page changes to it at once, or offers both clients for a while.

The rest:

- Where the decompiled source goes, and how the hotel offers LibreShockwave's source to players, are
  [the assets feature](/features/assets/spec.md)'s.
