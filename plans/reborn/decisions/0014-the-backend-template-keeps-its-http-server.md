---
type: Decision
title: The backend template of tools/create keeps its HTTP server
description: make create template=backend still generates a package with a Mount, a router and an HTTP server, though the game server no longer has one.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [tools]
---

# Decision

- The backend template of `tools/create` stays as it is: a generic starter for web packages.

# Context

The game server's HTTP listener on 15445 came from that template and went with
[platform-01](/tasks/platform-01-drop-the-unused-listener.md). Asked whether the template should change, the user chose
"Leave it".

# Consequences

- Nothing in the hotel uses the template's HTTP server; a package that needs none deletes it after `make create`.
