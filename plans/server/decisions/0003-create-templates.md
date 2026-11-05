---
type: Decision
title: tools/create makes fullstack, backend and client projects
description: tools/create takes -template=fullstack|backend|client; fullstack is today's output and the default, backend is a Go package and runner only, and client is a Vite package like client-r26.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [tools, packages]
---

# Decision

`tools/create` takes `-template=fullstack|backend|client`:

| Template | Creates |
| --- | --- |
| `fullstack`, the default | Today's output: `packages/<name>` with the Go package and its Astro, Svelte and Tailwind frontend, and `apps/<name>` with the runner, the `-dev` runner that proxies Astro, `.air.toml` and the `Makefile` |
| `backend` | `packages/<name>` with the Go package only, and `apps/<name>` with the runner, `.air.toml` building `cmd/<name>` and the `Makefile`; no Astro, no pnpm, no `-dev` runner |
| `client` | `packages/<name>` only, a Vite package like `packages/client-r26`: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, built with pnpm; no Go and no `apps/<name>` |

# Context

The user: "so we can remove astro and frontend stuff after running @tools/create/ (we can even create some templates,
for fullstack apps, backend only, client only)". Offered all three templates, the backend one alone, or none, they chose
all three; for the client template they chose a Vite package like `client-r26`, which a future `client-r18` would
follow.

# Consequences

- The game server is created with the backend template ([0002](/decisions/0002-server-app.md)).
- [s0-02](/tasks/s0-02-create-templates.md) builds the templates.
