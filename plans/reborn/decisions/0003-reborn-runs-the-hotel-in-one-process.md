---
type: Decision
title: reborn runs the hotel in one process, and the separate programs stay
description: apps/reborn runs the installer, the site, housekeeping and the game server in one process on one mux with one database handle, its logic in packages/reborn and its address in a new reborn section of config.json; the standalone runners stay, for work on one program and for testing how programs talk.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, orchestrator, config]
---

# Decision

- `apps/reborn` is the runner of the whole hotel: the installer, the CMS and housekeeping on one `http.ServeMux`, and the
  game server's two WebSocket listeners, in one process.
- Its logic lives in a new package, `packages/reborn`, which Go tests reach: whether the hotel is installed, the
  installer and its hand-over, building and running the programs, and stopping them. `apps/reborn/cmd/reborn/main.go`
  only wires. It is the user's file: it is shown to the user in full and written only on the user's yes.
- `config.json` gains a section `reborn` with `host`, default `localhost`, and `port`, default `16416`, the port
  `tools/create` derives for the name `reborn`. Under reborn, `cms.host`, `cms.port`, `housekeeping.host` and
  `housekeeping.port` go unused; the separate programs still read them.
- One `*sql.DB` is shared by the CMS, housekeeping and the game server
  (`plans/holo-port/decisions/0029-package-level-settings-and-auth.md`). The installer keeps opening its own.
- The game server keeps its own WebSocket ports, `server.info` 30000 and `server.mus` 30001
  (`plans/server/decisions/0020-info-and-mus-websocket-ports.md`): a hotel opens 16416, 30000 and 30001.
- The standalone runners of the CMS, housekeeping, the installer and the game server stay. Work that needs more than one
  program runs under reborn; a standalone runner is for one program, or for testing how separate programs talk.

# Context

The user, starting the platform slice: "now that we have cms + housekeeping + server, we can start the orchestractor, it
can be a folder in apps only called "reborn", this should keep installer + cms + housekeeping in the same mux and run the
server too."

Asked where the logic lives, the user chose a new `packages/reborn` over all of it in `main.go`; asked which keys hold
the address, "A new reborn section", with the port 16416; asked about the database, "One shared". On the game's ports:
"you said last time that libreshockwave opens ws://host:port, so we can only have three ports. the main 16416 plus 30000
and 30001".

On the runners: "i want to use reborn, i keep standalone runners to make it non-opinionated on how to use this project.
reborn is easier when anyone want to test a full feature, including cms+housekeeping+game server. on the other hand, i
want to work on cms only, then i run the cms standalone only." And: "if it requires more than 1 app then reborn is the
way to go, if we want to test communication between standalone runners, then the standalone is the way to go."

The study is [the orchestrator study](/reference/research-orchestrator.md).

# Consequences

- The CMS, housekeeping and the game server are built in that order, so that the CMS's automatic updates run before the
  game reads the database.
- One shared connection: every query of the site and the game takes its turn, and a long transaction makes everyone
  wait. Inside a transaction, code reads only through the transaction's queries, as everywhere
  (`plans/holo-port/decisions/0011-store-returns-sql-db.md`).
- `go.work` gains `packages/reborn` and `apps/reborn`; the root `Makefile` gets back its `dev` and `build` targets.
