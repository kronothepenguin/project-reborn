---
type: Phase
title: S0 Foundations
description: The plan and its skill, the three tools/create templates, and an empty server that accepts R26 clients over TCP and WebSocket, frames their packets and answers HELLO.
status: active
timestamp: 2026-11-06T17:54:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s0, server]
---

# Goal

`apps/server` runs and accepts R26 clients over TCP and over WebSocket. It reads their packets, sends `HELLO`, and logs
each packet it does not handle yet. `tools/create` makes fullstack, backend and client projects.

# Scope

| Part | Where | Decisions |
| --- | --- | --- |
| The plan bundle, the `tracking-plans` skill and the `.claude/skills` link | `plans/server`, `.agents/skills/tracking-plans`, `.claude/skills` | [0001](/decisions/0001-plan-in-plans-server.md) |
| The fullstack, backend and client templates | `tools/create` | [0003](/decisions/0003-create-templates.md) |
| The server's package and runner, from the backend template | `packages/server`, `apps/server` | [0002](/decisions/0002-server-app.md), [0005](/decisions/0005-package-layout.md) |
| The listeners: TCP addresses and WebSocket paths, each with its protocol | `packages/config` | [0007](/decisions/0007-protocols-per-listener.md) |
| `Conn`, TCP and the WebSocket with `Mount(mux)` | `packages/server/transport` | [0006](/decisions/0006-transport.md) |
| B64, VL64 and strings | `packages/server/encoding` | [0005](/decisions/0005-package-layout.md), [s1-01](/tasks/s1-01-fuse-client.md) |
| A protocol per listener, R26 framing, `HELLO`, packets dispatched by id | `packages/server`, `packages/server/r26` | [0007](/decisions/0007-protocols-per-listener.md), [0012](/decisions/0012-no-encryption.md) |

S0 writes no game rules and no `virtual` state: those start in [S2](/phases/s2-login.md).

# Exit criteria

- Every gate passes (`make gates`).
- A Go test client connects over TCP and over WebSocket, receives `HELLO`, sends `INIT_CRYPTO`, and the server logs it
  by name.
- The encoding reads and writes every value form of [the wire format](/reference/client-r26.md#wire-format), with test
  cases worked out from the client's scripts.
- `tools/create -template=fullstack`, `-template=backend` and `-template=client` each make a project that passes the
  gates.

# Tasks

1. [s0-01 Create the plan bundle and the tracking-plans skill](/tasks/s0-01-plan-bundle.md) **done**
2. [s0-02 Add the backend and client templates to tools/create](/tasks/s0-02-create-templates.md) **done**
3. [s0-03 Create packages/server and apps/server](/tasks/s0-03-scaffold-server.md)
4. [s0-04 Declare the server's listeners in config.json](/tasks/s0-04-listener-config.md)
5. [s0-05 Write the transport](/tasks/s0-05-transport.md)
6. [s0-06 Write the encoding](/tasks/s0-06-encoding.md)
7. [s0-07 Serve R26 sessions](/tasks/s0-07-r26-sessions.md)
8. [s0-08 Check S0's exit criteria](/tasks/s0-08-exit-check.md)
9. [s0-09 Make the Go templates work for every name tools/create accepts](/tasks/s0-09-go-template-names.md)

S0 runs on the branch `s0`. s0-06 waits for [s1-01](/tasks/s1-01-fuse-client.md) and s0-07 for
[s1-02](/tasks/s1-02-entry-init.md), both of S1, which runs beside it.

# Open questions

Asked when their task starts:

- s0-04: the keys of the listeners in `config.json`, and the default ports and WebSocket path. `#info` and `#mus` share
  one WebSocket path and differ by port, so each port speaks one protocol
  ([0015](/decisions/0015-client-on-libreshockwave.md)).
- s0-07: what the server logs for each packet; and the change to the generated runner, which belongs to the user, that
  serves the TCP listeners beside the HTTP server.
- s0-09: what a fullstack or backend project's name with a `-` becomes.
