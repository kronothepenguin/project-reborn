---
type: Slice
title: Platform: one binary, and programs that hear of each other's changes
description: The orchestrator apps/reborn runs the installer, the site, housekeeping and the game server in one process, and a notice package lets a change made by one program reach the others.
status: active
projects: [apps, server, cms, housekeeping, installer, config, scheduler]
depends_on: []
from: ["plans/later.md", "plans/server/phases/s9-site-changes.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [platform, orchestrator, bus]
---

# Goal

One binary runs the whole hotel, and a change made on the site or in housekeeping reaches a player who is online at
once.

The user: "server has an unused http server because of the template i think in the port 15445. you can remove it."

The user: "now that we have cms + housekeeping + server, we can start the orchestractor, it can be a folder in apps only
called "reborn", this should keep installer + cms + housekeeping in the same mux and run the server too."

The user, on how the programs talk: "at first i thought it would be cool to pass something into constructors to tell
each app they are either as standalone or in orchestractor... i'm thinking something like `WithHousekeeping(instance)`
but as everything depends on everything else, there will be circular dependencies. Now, if we create something like unix
sockets, we can communicate everything in the orchestractor or as standalone the same way. but modifying the virtal
state directly can be a way to keep everything up to date without complex stuff. do you recommend go as orchestractor
first and then build standalone later. for dev and deploy orchestractor is easier to work with, for standalone you end
up having 3 terminals running each project. we can define an extra package as an event broker, so we can register every
app in the orchestractor or a kind of api in standalone, so the api uses the udp, stdio or unix sockets or whatever we
use to communicate between apps, this way we have the same interface but a different implementatino, that means the same
segregated interfaces but every app has its own implementation to communicate between each other when there are changes
to the virtual state or db, and the system keeps in sync."

# Scope

| Project | Part |
| --- | --- |
| `apps/server`, `packages/server` | The unused HTTP listener on 15445 is gone ([platform-01](/tasks/platform-01-drop-the-unused-listener.md)) |
| `apps/reborn` | The orchestrator: one mux for the installer, the site and housekeeping, and the game server's listeners, as [the study](/reference/research-orchestrator.md) proposes |
| `packages/installer` | What the orchestrator needs of it: whether the hotel is installed, when the installation ends, a place on a shared mux |
| a new package | Notices between the programs, and the questions the site asks the game server, as [the study](/reference/research-communication.md) sketches |
| `packages/server` | Receives the notices: credits, hand, badges, look, club, fuses, groups, bans, alerts, an archived habbo, the catalogue |
| `packages/cms`, `packages/housekeeping` | Publish a notice after each change that a player online must see |
| releases | One binary in place of three (`plans/later.md`, "One binary") |

What the site shows of the game server, who is online and where, is [presence and rooms](/slices/presence-and-rooms.md);
the changes each feature sends are that feature's slice. This slice builds the road.

Answers to the user's question, from the study, to be confirmed: the orchestrator first, with notices inside one
process, and the transport for separate programs later behind the same interface; a neutral package that imports
nothing, so no program imports another; and no program changing another's memory directly, since most changes must reach
the player's client, which only the game's rules know how to do.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

1. [platform-01 Drop the game server's unused HTTP listener](/tasks/platform-01-drop-the-unused-listener.md) **done**

The rest is written once the open questions are answered.

# Open questions

- The thirteen questions of [the orchestrator study](/reference/research-orchestrator.md#questions-for-the-user): how
  `apps/server` keeps running without its HTTP server, how the installer and the hotel share one port, the address
  before `config.json` exists, the config keys, one database handle or one a program, where the orchestrator's logic
  lives, `make dev`, releases, shutdown, the WebSocket ports.
- The twelve questions of [the communication study](/reference/research-communication.md#questions-for-the-user):
  notices in place of server 0013, the package's name, package-level or passed into `New`, ids only, lost notices, an
  archived habbo that is in the hotel, IP bans, the polling of settings in every mode, the transport for separate
  programs, the ban gap.
- From `plans/server/phases/s9-site-changes.md`, as written there: "The list of commands." "How the commands travel
  while the programs run apart." "How the server's writes keep what the site wrote, such as credits changed in both at
  once." The study answers the first and the third; the second is its eleventh question.
- From `plans/later.md`: reopening the installer of a hotel that is installed is a secured decision of an administrator,
  designed when this starts.
- Who writes `apps/reborn/cmd/reborn/main.go` and the change to `apps/server/cmd/server/main.go`: the user, or an agent
  from a change shown first.
