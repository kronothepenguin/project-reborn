---
okf_version: "0.2"
---

# Game server

State of Project Reborn's game server: a TCP and WebSocket server without web pages that speaks the protocol of the
R26 Shockwave client (`packages/client-r26`). It lives in `packages/server`, runs from `apps/server`, and keeps its
state in `packages/virtual` ([0002](/decisions/0002-server-app.md), [0005](/decisions/0005-package-layout.md)).

## Resume here

1. Read the [rules](/rules.md).
2. Read the newest entries of the [log](/log.md).
3. Open the [task index](/tasks/index.md): in-progress tasks first, then the todo tasks of the active phases.

Active phase: [S4 Rooms](/phases/s4-rooms.md). [S0 Foundations](/phases/s0-foundations.md),
[S1 R26 protocol reference](/phases/s1-protocol-reference.md), [S2 Login and session](/phases/s2-login.md) and
[S3 Navigator](/phases/s3-navigator.md) are done.

Work planned for later that belongs to no phase, such as r18 and the orchestrator, is listed in `plans/later.md`.

## Contents

- [Rules](/rules.md) — How tasks, decisions, phases and log entries of the game server are created and kept up to date.
- [Log](/log.md) — Dated history of the game server, newest first.
- [Decisions](/decisions/index.md) — Design decisions confirmed by the user.
- [Phases](/phases/index.md) — The phases of the game server with scope, exit criteria and open questions.
- [Tasks](/tasks/index.md) — Units of work and their status, grouped by phase.
- [Reference](/reference/index.md) — What the R26 client, the Holograph Emulator and the old server contain, and how the new server is built.

## Ground rules from the user

They come from the original request, `AGENTS.md` and the user's corrections, and apply to every task.

| Concern | Rule |
| --- | --- |
| Program | `packages/server` + `apps/server`, created with `tools/create -template=backend`, with no web pages ([0002](/decisions/0002-server-app.md)) |
| IO | through interfaces: TCP and WebSocket behind one byte-stream `Conn`, and the WebSocket mounts on any HTTP mux ([0006](/decisions/0006-transport.md)) |
| Protocol | a Go package named `r26`; `config.json` gives the client's `info` and `mus` connections a host and a port each, the server runs a WebSocket listener on each, and TCP, WebSocket paths and r18 can come later ([0020](/decisions/0020-info-and-mus-websocket-ports.md)) |
| Protocol source | the client's `.ls` scripts under `packages/client-r26/src/game/`, never its `.js` ([0008](/decisions/0008-reverse-engineer-ls-only.md)) |
| Emulator | `source/holoemu/` is read only when the `.ls` scripts are not enough, and is never ported ([0016](/decisions/0016-holoemu-is-a-reference.md)) |
| State | `packages/virtual`: hot data copied from the database, and temporary data that lives only in memory ([0009](/decisions/0009-virtual-holds-the-server-state.md)) |
| Saved or memory-only | asked to the user for each kind of data, never assumed ([0011](/decisions/0011-saved-and-memory-only-data.md)) |
| Old server | the structure of the deleted `packages/server` (commit `2ea51d7b`) is the model ([0004](/decisions/0004-old-server-is-the-model.md)) |
| Database | `packages/store` with sqlc, documented as OKF, through the `adding-data-persistence` skill |
| Environment variables | never, unless the user asks |
| Architecture | follow the user's decisions; anything not covered is asked before acting |
| Runners | `apps/**/cmd/**` belongs to the user: a change there is described and asked for, never made unasked |
| Code comments | only for non-obvious architecture or tricky edge cases |
| Commits | never on `main`: each line of work has its own feature branch and worktree, which the agent merges once every gate passes, never pushed (`plans/holo-port/decisions/0097-no-agent-works-on-main.md`) |
