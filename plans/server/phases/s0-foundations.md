---
type: Phase
title: S0 Foundations
description: The plan and its skill, the three tools/create templates, and an empty server that accepts R26 clients over WebSocket, frames their packets and answers HELLO.
status: active
timestamp: 2026-11-07T00:25:22+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s0, server]
---

# Goal

`apps/server` runs and accepts R26 clients over WebSocket, on the host and port of `server.info`
([0020](/decisions/0020-info-and-mus-websocket-ports.md)). It reads their packets, sends `HELLO`, and logs each packet
it does not handle yet. `tools/create` makes fullstack, backend and client projects.

# Scope

| Part | Where | Decisions |
| --- | --- | --- |
| The plan bundle, the `tracking-plans` skill and the `.claude/skills` link | `plans/server`, `.agents/skills/tracking-plans`, `.claude/skills` | [0001](/decisions/0001-plan-in-plans-server.md) |
| The fullstack, backend and client templates | `tools/create` | [0003](/decisions/0003-create-templates.md), [0024](/decisions/0024-go-package-names-drop-the-dash.md) |
| The server's package and runner, from the backend template | `packages/server`, `apps/server` | [0002](/decisions/0002-server-app.md), [0005](/decisions/0005-package-layout.md) |
| The listeners: `server.info` and `server.mus`, a host and a port each | `packages/config` | [0020](/decisions/0020-info-and-mus-websocket-ports.md) |
| `Conn`, TCP and the WebSocket as an `http.Handler` | `packages/server/transport` | [0006](/decisions/0006-transport.md) |
| B64, VL64 and strings | `packages/server/encoding` | [0005](/decisions/0005-package-layout.md), [s1-01](/tasks/s1-01-fuse-client.md) |
| A WebSocket listener on each connection's host and port, started by `StartInfo` and `StartMus`, R26 framing on `info`, `HELLO`, packets dispatched by id, and the unhandled ones logged | `packages/server`, `packages/server/r26` | [0020](/decisions/0020-info-and-mus-websocket-ports.md), [0012](/decisions/0012-no-encryption.md), [0021](/decisions/0021-unhandled-packets-logged-by-id-name-and-size.md), [0022](/decisions/0022-start-info-and-start-mus.md), [0023](/decisions/0023-mus-listener-before-s7.md) |

S0 writes no game rules and no `virtual` state: those start in [S2](/phases/s2-login.md).

# Exit criteria

- Every gate passes (`make gates`).
- A Go test client connects to the `info` WebSocket listener, receives `HELLO`, sends `INIT_CRYPTO`, and the server
  logs it by name. TCP is tested at the transport level, in [s0-05](/tasks/s0-05-transport.md).
- The encoding reads and writes every value form of [the wire format](/reference/client-r26.md#wire-format), with test
  cases worked out from the client's scripts.
- `tools/create -template=fullstack`, `-template=backend` and `-template=client` each make a project that passes the
  gates.

# Tasks

1. [s0-01 Create the plan bundle and the tracking-plans skill](/tasks/s0-01-plan-bundle.md) **done**
2. [s0-02 Add the backend and client templates to tools/create](/tasks/s0-02-create-templates.md) **done**
3. [s0-03 Create packages/server and apps/server](/tasks/s0-03-scaffold-server.md) **done**
4. [s0-04 Declare the hosts and ports of info and mus in config.json](/tasks/s0-04-listener-config.md) **done**
5. [s0-05 Write the transport](/tasks/s0-05-transport.md) **done**
6. [s0-06 Write the encoding](/tasks/s0-06-encoding.md) **done**
7. [s0-07 Serve R26 sessions](/tasks/s0-07-r26-sessions.md) **done**
8. [s0-08 Check S0's exit criteria](/tasks/s0-08-exit-check.md)
9. [s0-09 Make the Go templates work for every name tools/create accepts](/tasks/s0-09-go-template-names.md) **done**
10. [s0-10 Handle the names whose Go package cannot compile](/tasks/s0-10-go-names-that-clash.md)

S0 runs on the branch `s0`. s0-06 waits for [s1-01](/tasks/s1-01-fuse-client.md) and s0-07 for
[s1-02](/tasks/s1-02-entry-init.md), both of S1, which runs beside it.

# Open questions

Asked when their task starts:

- s0-10: what `tools/create` does with a name whose Go package name the generated Go cannot use: a Go keyword, `main`,
  or a name the generated files already use, such as `log`, `http`, `db` or `new`.
