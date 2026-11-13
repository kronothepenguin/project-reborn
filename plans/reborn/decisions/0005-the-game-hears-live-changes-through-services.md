---
type: Decision
title: The game hears of live changes through services
description: Changes the game must show at once reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store nothing.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, services, server, cms, housekeeping]
---

# Decision

- A service exists only for what the game server must show live: a habbo's look, credits, furni in a room, rooms, the
  navigator. What is read on use, such as settings or the hotel's name, needs none. Each feature adds its own service in
  its own slice: habbos, economy, badges, access (bans) and the rest.
- The contracts are Go interfaces in one shared package, `packages/services`, with their plain types. It imports no app.
- Each app does the work in its own exported methods, such as `(*server.Server).SendLook(ctx, avatarID)`. Two
  implementations call them and do exactly the same:
  - the memory API, in `packages/reborn`, which holds the app instances and calls the methods in the same process;
  - the remote API, for programs run apart: HTTP under `/api/`, mounted only when the program runs alone, with the
    option `WithAPI()`. The game server gets an HTTP listener again for it, on `server.api` (default
    `localhost:15445`), opened only with `WithAPI()`. Its client is `packages/server/api`.
- Every remote call carries a secret in the header `X-Reborn-Secret`; a missing or wrong secret is answered 404. The
  secret is generated once by a database update, in a one-row table `api_secret` that housekeeping never shows, and
  every program reads it at start.
- An app takes its services through `Inject`, once, after `New` and before it runs:
  `site.Inject(cms.Services{Habbos: h})`. The order is constructors, then services, then `Inject`, then run.
- A call carries ids only, such as `Habbos.SendLook(ctx, avatarID)`, and the game reads the store again. Services only
  communicate and store nothing; a service that must save something is decided when it comes.
- A remote call that fails is logged and the page carries on: the change is saved, and the habbo sees it at the next
  login. A call gives up after 2 seconds.
- The CMS and housekeeping serve no `/api/` until a service needs one: they read the store on each request.

# Context

The user's design: "services: segregated contract interfaces - memory api: implements services and holds an instance to
apps. e.g. *server.Server, *cms.CMS, *housekeeping.Housekeeping - http api: as i said, just a /api/ expose and secure
with headers and secrets. if secret is missing answer 404." And: "the trickiest part of this methodoloty is the setup,
we have to first start everything and later on configure the services [...] the order is apps contructors -> services
-> configure apps (inject services) -> run apps."

On what a service is: "services are something in the game server that needs live reload or real-time refresh. [...]
housekeeping can modify credits, so credits would need service to notify the game server about a change [...] something
like hotel name that does not change frequently is not part of real-time. something like the figure of the habbo is
real-time". On a service named after a mechanism: "do not call a service "updates" that means nothing".

The user chose HTTP `/api/` for the game too ("we can also just get back the http server for the game server and expose
/api/ and do not use mus for the game server"), the secret in the database, the memory API in `packages/reborn`, a
shared contracts package (asked whether the Go rule that consumers define interfaces argues against it: each contract
has several consumers and two implementations, as `io.Writer` does), `Inject` over `Configure`, ids only ("as it is
save already the "Changed" is what we need only [...] keep the note of making apis for communication purposes only and
do not store anything but left the door open if an api needs to store something in the database"), and "Log it, carry
on" for a failed call.

# Consequences

- Supersedes `plans/server/decisions/0013-site-changes-like-mus.md`: the site never changes the game's state directly,
  even in one process. Its first point stands: the game is told of a change it holds.
- Replaces the notices of [the communication study](/reference/research-communication.md).
- Options now also carry what differs between reborn and a program run alone (`WithAPI`, the installer's
  `WithListener`); required dependencies are never options.
- The first service is `Habbos`, built with [the habbos slice](/slices/habbos.md).
