---
type: Slice
title: The client in the browser
description: A signed-in habbo opens the site's client page, where the R26 client runs on LibreShockwave; one program serves the client's files; and later the client runs in vanilla JavaScript.
status: active
projects: [cms, housekeeping, client, apps]
depends_on: []
from: ["plans/client/phases/c1-client-page-on-libreshockwave.md", "plans/client/phases/c2-client-files.md", "plans/client/phases/c3-javascript-client.md"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [client, libreshockwave]
---

# Goal

The R26 client reaches the player's browser. It was the client bundle's phases C1 to C3, in their order: the `.dcr` on
LibreShockwave in the site's client page; one program for the client's files, with the external texts and variables
edited in housekeeping; and a client in vanilla JavaScript
(`plans/client/decisions/0002-libreshockwave-first-then-javascript.md`).

The client page comes first, for [the habbos slice](/slices/habbos.md)
([0012](/decisions/0012-the-client-page-ports-holos-on-libreshockwave.md)).

# Scope

| Part | Planned in |
| --- | --- |
| The client page on LibreShockwave | `plans/client/phases/c1-client-page-on-libreshockwave.md`, and [0011](/decisions/0011-no-habbo-files-in-the-repository.md) and [0012](/decisions/0012-the-client-page-ports-holos-on-libreshockwave.md) |
| The client's files | `plans/client/phases/c2-client-files.md`, which runs inside reborn ([platform](/slices/platform.md)) |
| The JavaScript client | `plans/client/phases/c3-javascript-client.md` |

The reference documents of `plans/client/reference/` stay where they are.

# Exit criteria

For the client page:

- A signed-in habbo opens the site's client page, and the R26 client runs there on LibreShockwave's player and logs in
  to the game server with the page's SSO ticket.
- The player is built from `vendor/LibreShockwave` by a make target, into a folder git ignores.
- Every gate passes.

The client's files and the JavaScript client get theirs when they start.

# Tasks

1. [client-01 Spike: the R26 client logs in on LibreShockwave](/tasks/client-01-spike-the-client-logs-in.md)
2. [client-02 The client page](/tasks/client-02-the-client-page.md)

# Open questions

- The client's files and the JavaScript client keep the open questions of their phases: six for the client's files,
  four for the JavaScript client.
- Where the decompiled source goes, and how the hotel offers LibreShockwave's source to players, are
  [the assets slice](/slices/assets.md)'s.
