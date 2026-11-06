---
type: Decision
title: The client template derives its Vite port from the name, in a range of its own
description: tools/create gives a client project the Vite dev server port 30000 + fnv32a("vite:" + name) % 10000, derived from the name as the Astro port is, in the range 30000 to 39999 that no other port uses.
status: accepted
timestamp: 2026-11-06T17:05:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:05:30+00:00"}
tags: [tools, packages]
---

# Decision

The client template's Vite dev server listens on a port derived from the project's name, as the app and Astro ports
are, in a range of its own:

| Port | Range | Derived as |
| --- | --- | --- |
| App | 10000 to 19999 | `10000 + fnv32a("app:" + name) % 10000` |
| Astro | 20000 to 29999 | `20000 + fnv32a("astro:" + name) % 10000` |
| Vite | 30000 to 39999 | `30000 + fnv32a("vite:" + name) % 10000` |

`fnv32a` is the 32-bit FNV-1a hash that `tools/create/cmd/create/ports.go` already uses. A client named `client-r18`
gets the port 30050.

# Context

[s0-02](/tasks/s0-02-create-templates.md) asked S0's open question: the client template's dev server port, derived
from the name like the Astro port, or chosen otherwise. The options, each with the port `client-r18` would get:

- derived from the name, in a range of its own, 30000 to 39999: 30050;
- derived from the name, in the Astro range: 25379;
- Vite's default, 5173, the same for every client;
- a `-port` flag, given when the project is created.

The user chose "Derived, own range".

# Consequences

- `tools/create` writes the port in the generated `vite.config.js`, and its dry run and printed plan show it.
- A client's Vite port never falls in the range of an app or an Astro port.
