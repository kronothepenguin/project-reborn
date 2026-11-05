---
type: Decision
title: The game server is packages/server and apps/server, with no web pages
description: The program is called server; packages/server holds it and apps/server runs it, as a TCP listener and a WebSocket server without web pages, created with the backend template of tools/create.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, packages]
---

# Decision

- The program is named `server`. `packages/server` holds its code, and `apps/server` is the thin runner, as for the
  other programs.
- It is a TCP listener and a WebSocket server. It has no web pages: no Astro, no Svelte, no pnpm.
- It is created with `tools/create -template=backend` ([0003](/decisions/0003-create-templates.md)).

# Context

The user: "the app will be called just "server", it is a tcp listener or web socket server without web ui, so we can
remove astro and frontend stuff after running @tools/create/".

# Consequences

- `plans/holo-port/reference/architecture.md` names `apps/server` as the game server's runner.
- The runner's `cmd` files belong to the user like every other runner's: once generated, a change to them is asked for.
