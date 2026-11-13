---
type: Spec
title: The client in the browser
description: A signed-in habbo opens the site's client page, where the R26 client runs on LibreShockwave; one program serves the client's files; and later the client runs in vanilla JavaScript.
status: active
projects: [packages/cms, packages/housekeeping]
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
- The player is built from `vendor/LibreShockwave` by a make target, into a folder git ignores.

The client's files and the JavaScript client get theirs when they start.

# Open questions

- The client's files and the JavaScript client keep the open questions of their phases: six for the client's files,
  four for the JavaScript client.
- Where the decompiled source goes, and how the hotel offers LibreShockwave's source to players, are
  [the assets feature](/features/assets/spec.md)'s.
