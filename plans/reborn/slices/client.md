---
type: Slice
title: The client in the browser
description: A signed-in habbo opens the site's client page, where the R26 client runs on LibreShockwave; one program serves the client's files; and later the client runs in vanilla JavaScript.
status: planned
projects: [cms, housekeeping, client, apps]
depends_on: []
from: ["plans/client/phases/c1-client-page-on-libreshockwave.md", "plans/client/phases/c2-client-files.md", "plans/client/phases/c3-javascript-client.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [client, libreshockwave]
---

# Goal

The R26 client reaches the player's browser. It was the client bundle's phases C1 to C3, in their order: the `.dcr` on
LibreShockwave in the site's client page; one program for the client's files, with the external texts and variables
edited in housekeeping; and a client in vanilla JavaScript
(`plans/client/decisions/0002-libreshockwave-first-then-javascript.md`).

# Scope

| Part | Planned in |
| --- | --- |
| The client page on LibreShockwave | `plans/client/phases/c1-client-page-on-libreshockwave.md` |
| The client's files | `plans/client/phases/c2-client-files.md`, which runs inside the one binary of [platform](/slices/platform.md) |
| The JavaScript client | `plans/client/phases/c3-javascript-client.md` |

The reference documents of `plans/client/reference/` stay where they are.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- The open questions of the three phases stand as written there: eight for the client page, six for the client's files,
  four for the JavaScript client. The first of them all: where the `.dcr` and its casts, which the user adds, live in
  the repository.
