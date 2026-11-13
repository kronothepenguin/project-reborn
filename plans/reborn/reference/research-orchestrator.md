---
type: Reference
title: Research: the orchestrator, apps/reborn
description: What the server's leftover HTTP listener is and what removing it takes, how each runner starts its package today, what was already decided about the orchestrator, the problems one mux and one process bring, and a proposal for apps/reborn.
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [research, platform, orchestrator, installer, server]
---

A read-only study of 2026-11-12, made by a research agent for the [platform slice](/slices/platform.md). Nothing here
is decided: the slice lists the questions the user answers before any task is written. Files under `apps/**/cmd/**`
are the user's: a change there is described and asked, never assumed.

# The leftover HTTP server on 15445

- `apps/server/cmd/server/main.go:22-31` builds a mux, calls `c.Mount(mux)` and serves it on `localhost:15445` with
  `log.Fatalln(server.ListenAndServe())`. Line 5 imports `net/http` for this alone.
- `packages/server/server.go:95-99`, `Mount`, registers one route, `GET /{$}`, which
  `packages/server/internal/router/index.go:9-11` answers with `Hello from Go`. `server.go:17` imports the router.
- It came from `tools/create -template=backend`.
- Nothing uses it: no test calls `Mount` or the port, `TestMain` (`packages/server/server_test.go:32-61`) calls only
  `New`, `StartInfo` and `StartMus`; the browser suites start only cms, housekeeping and installer
  (`tests/e2e/lib/hotel.mjs:24`); air only builds and runs the binary. The only mentions are documents:
  `apps/server/README.md:12,21,29` and `packages/server/README.md:5,13,19,622,689`.

| File | Change |
| --- | --- |
| `packages/server/server.go` | Delete lines 95-99 and the router import. `net/http` stays, since `listen` uses `http.Serve` |
| `packages/server/internal/router/` | Delete `router.go` and `index.go` |
| `packages/server/README.md` | Lines 5, 13, 19, 621-623 and 689 |
| `apps/server/README.md` | Lines 12, 21 and 29 |
| `apps/server/cmd/server/main.go` | The user's file: delete line 5 and lines 22-31 |

Without `ListenAndServe`, `main` returns right after `StartMus`, since both listeners serve in goroutines
(`server.go:126-133`), so `main` must block: `select {}` after the two starts. The removal is needed for the
orchestrator too: `server.Mount` registers `GET /{$}`, the CMS's own pattern, and a shared `ServeMux` panics on a
duplicate. The backend template of `tools/create` still generates `Mount`, the router and an `http.Server`, and
`writer_test.go:107-128` asserts them; a variant without HTTP is not needed for this removal.

# How each runner starts its package

| | Constructor | Address | Registers on the mux | Background work |
| --- | --- | --- | --- | --- |
| installer | `installer.New(ctx, WithResolver, WithStatic) (*Installer, error)` (`installer.go:26`); `setup.Open` opens its own database only if `config.json` exists | `localhost:17306`, baked into both runners, which wrap the mux in `http.NewCrossOriginProtection()` | `GET /{$}`, `/config`, `/site`, `/admin`, `/done`, and `/` for static files (`installer.go:41-50`) | none |
| cms | `cms.New(db, WithResolver, WithStatic)` (`cms.go:37`) | `cms.host:cms.port`, localhost:17387 | About 110 routes at the root, `GET /{$}` and `/` for static files among them (`:193`), each behind RealIP, cross-origin protection, sessions, the update gate and the maintenance gate | `ApplyAutomatic` and `settings.Load`; settings reload every `cms.refresh` seconds, expired resets and expired sessions every minute |
| housekeeping | `housekeeping.New(db, …)` (`:37`) | `housekeeping.host:port`, localhost:18465 | Only `/housekeeping/...`, never `/` | `ApplyAutomatic` and `settings.Load`; expired sessions every minute |
| server | `server.New(db)` (`:38`), which panics on an error | the leftover on 15445; WebSockets on `server.info` 30000 and `server.mus` 30001 | the leftover `GET /{$}` | `settings.Load`; shared data at once or after updates; shared data and settings reload every `cms.refresh` seconds; `PruneChat` every hour; `StartInfo` and `StartMus` call `config.Load()` and serve in goroutines |

- `store.FromConfig()` (`store.go:77`) opens a pool of one connection (`:58`), WAL, busy_timeout 5000.
- `config.Load` runs once a process and writes a default `config.json` when the file is missing
  (`config.go:120-123`). The installer calls it only once the file exists.
- No program shuts down in order: every runner ends with `log.Fatalln(ListenAndServe())`, and every `New` discards the
  stop function of `scheduler.Every`.

# What was already decided or said

- `plans/later.md`, "The orchestrator": one binary that administrators replace and restart; releases publish that one
  binary; the installer runs only when nothing is installed; reopening the installer is a later, secured decision.
- holo-port decisions: `plans/holo-port/decisions/0039-orchestrator-is-a-later-project.md` (`apps/reborn` is the
  orchestrator, and its old implementation is not coming back); 0003 (housekeeping only under `/housekeeping/`); 0029
  (`New(db, opts)`, "mount every app on one mux with one shared db"); 0043 (tasks registered in `New`, so the runners
  stay untouched); 0051 ("in one process with the orchestrator the refresh does not run"); 0052 (the installer has no
  modes; the orchestrator can override what the installer suggests, designed with the orchestrator); 0069 to 0071
  (updates); 0047 (every program works on an empty database); 0062 (releases ship three binaries).
- server decisions: 0020 (one host and port a connection for now), 0022 ("The orchestrator starts the listeners with
  the same two calls"), 0013 (the site changes the game's state directly, which
  [the communication study](/reference/research-communication.md) asks to replace).
- The old `apps/reborn` in git history (`72e7f2d8`, moved in `19d8f75c`, deleted in `640b0b7d`) was a stub: an empty
  `main`, an `http.Server` built from environment variables, the cgo SQLite driver. It mounted nothing.

# Problems the orchestrator must solve

1. The installer and the CMS clash on one mux: both register `GET /{$}` and `/` (`installer.go:41,50`, `cms.go:193`),
   and both serve built assets at `/_astro/...` and `/favicon.svg`. And the CMS cannot be built before the installer's
   config step: `cms.New` calls `config.Get()`, which would write a default `config.json`, and the installer would skip
   its config step. So the hotel is built after the installation.
2. Nothing tells "installed?" or "the installation finished". The rule, `config.json` exists and someone holds
   `housekeeping.accessGroups` (`setup.go:136-150`), lives in `internal/setup`.
3. The address before `config.json` exists: `config.Load` must not run then. The config form asks for a hotel port and
   a housekeeping port; the first may differ from the one already listened on, and the second means nothing here. The
   site step suggests `http://localhost:<housekeeping port>/housekeeping` (`site.go:25-37`).
4. The CMS and housekeeping do not clash, and each `Mount` protects its own routes. The installer's runner wraps the
   whole mux; its `Mount` protects nothing.
5. Waiting for updates already works in one process. Order matters: the CMS first, so its `ApplyAutomatic` runs before
   `server.New` reads settings.
6. One shared handle means one connection for everything: every query of the site and the game queues behind every
   other, where three processes read in parallel today, and a transaction holds the one connection for everyone.
7. Package-level state shared in one process is what is wanted: settings, `virtual/furni`, later `room` and `habbo`.
8. Some scheduled tasks would run twice: the settings reload (CMS and server) and the expired sessions (CMS and
   housekeeping). Harmless, but against holo-port 0051, and nothing can switch them off without a new API.
9. Logging: the browser suites' "nothing but the start-up line" rule and banner pattern (`tests/e2e/lib/hotel.mjs:25`)
   need an entry for `reborn`.
10. A shutdown in order would need `Shutdown`, a server API that stops the listeners and closes sessions, the
    scheduler's stop functions, then `db.Close`.
11. Importing the three packages embeds all three `DistFS`, about 13 MB, 440 KB and 80 KB. A real build needs
    `make frontends` first.
12. `config.json` has every section already; `housekeeping.host` and `housekeeping.port` are unused under the
    orchestrator.
13. The game's WebSockets keep their own ports through `StartInfo` and `StartMus`. Later, `transport.WebSocket(h)` is an
    `http.Handler` and could hang off the mux.
14. A dev runner that proxies two Astro dev servers cannot work: both claim root paths such as `/@vite/client`. And
    the user's own CMS process may hold port 17387.

# Proposal

- `apps/reborn`: `go.mod` (cms, housekeeping, installer, server, store, config, astro; `tool air`), a `Makefile`
  (`install`, `dev`), `.air.toml`, `README.md`, `cmd/reborn/main.go`, and maybe `reborn.go` for logic a test can
  reach. `use ./apps/reborn` in `go.work`; the root Makefile's `dev` and `build` restored.
- What `main` does, in order:
  1. If `config.json` exists, open the database and ask a new `installer.Installed(ctx, db)`. If not, the hotel is not
     installed, and `config.Load` is never called.
  2. One mux, on `cms.host:cms.port` of `config.json`, or the CMS's defaults without writing the file.
  3. Not installed: build the installer and mount it under `/installer/`; a guard sends every other path there; a
     goroutine waits on a new `(*Installer).Done()`, runs step 4 and turns the guard off.
  4. Build the hotel: open the database if needed; `cms.New`, `housekeeping.New`, `server.New`, in that order; mount the
     CMS and housekeeping on the same mux, which is safe on a live `ServeMux`; `StartInfo` and `StartMus`.
  5. Serve, logging `reborn on http://…`.
- Package changes: `packages/server` loses `Mount` and its router. `packages/installer` gains `Installed`, `Done`,
  cross-origin protection inside `Mount`, an option for the addresses its forms suggest, and, for `/installer/`, Astro's
  `base`, prefixed links, forms and redirects, and static files through `StripPrefix`; its own runners then serve
  `:17306/installer/`. The CMS and housekeeping need nothing.
- Tests: units for `Installed`, `Done`, the prefixed routes and the cross-origin refusal; `apps/reborn` built and
  vetted by the gates; a browser suite `reborn` from an empty folder: the installer at `/installer/`, `/` redirecting to
  it, then the CMS at `/` and housekeeping at `/housekeeping/` in one session, a WebSocket to `server.info` receiving
  `HELLO`, and no log line beyond the start-up line.

Alternatives: the installer under `/installer/` on the same mux (recommended); the installer keeps `/` and the handler
is swapped when it is done, which breaks the done page's assets; or the installer on 17306 during the installation and
the hotel on its own port after, the simplest, but not one mux. One shared database handle (recommended, as holo-port
0029 says), or one a program, which keeps today's parallel reads. The refresh and the doubled tasks left in `New`
(recommended), or a `StartRefresh` that only the separate runners call.

# Risks

- One connection: pages wait under the game's load, and a long transaction anywhere stalls everything.
- Any early `config.Load` writes a default `config.json` and silently skips the installer's config step.
- A port chosen in the form that differs from the one listened on moves the hotel only at the next restart.
- `/installer/` ripples into the installer's dev runner, the browser suites' harness and their "together" suite.
- No shutdown: game sessions are cut without `game.Logout`, as today.
- In dev, the orchestrator collides with the user's CMS process on 17387.
- Releases and CI change if `reborn` becomes the only binary (holo-port 0062).

# Suggested tasks

| # | Task | Touches | Needs the user's OK for `cmd`? |
| --- | --- | --- | --- |
| 1 | Remove the server's HTTP server | `packages/server`, `apps/server/README.md`, `apps/server/cmd/server/main.go` | Yes |
| 2 | Installer: `Installed`, `Done`, protection inside `Mount`, the option for suggested addresses | `packages/installer` | No |
| 3 | Installer under `/installer/` | `packages/installer`, `apps/installer/cmd/*`, `apps/installer/README.md`, `tests/e2e` | Yes |
| 4 | Scaffold `apps/reborn`, `go.work`, the root Makefile's `dev` and `build` | those files | No |
| 5 | `apps/reborn/cmd/reborn/main.go`, and `reborn.go` if chosen | `apps/reborn` | Yes, shown in full first |
| 6 | Browser suite `reborn` | `tests/e2e` | No |
| 7 | Documents: both architecture references, `plans/later.md`, `README.md` | `plans/`, `README.md` | No |
| 8 | One-binary releases | Makefile `release`, `.github` | No |
| 9 | A shutdown in order, later | `packages/server`, `packages/scheduler`, `apps/*/cmd/*` | Yes |

# Questions for the user

Each with the agent's recommendation first.

1. Once 15445 is gone, how does `apps/server`'s `main` keep running? End it with `select {}`; or wait for Ctrl-C with
   `signal.NotifyContext`, useful once there is cleanup to run.
2. Does the backend template of `tools/create` keep generating an HTTP server? Leave it; or make it HTTP-free; or add a
   template for services. Example: `make create name=tracker template=backend` still answers "Hello from Go".
3. How do the installer and the hotel share one port? The installer moves under `/installer/`, everything else
   redirects there until the administrator exists, then the CMS and housekeeping join the same mux; or the handler is
   swapped when it is done; or two ports. Example: a new folder opens on `localhost:17387/installer/`, and after
   "Create administrator" `/` is the hotel. The installer run alone becomes `:17306/installer/`.
4. Before `config.json` exists, which address does the orchestrator listen on? The CMS's defaults, without writing the
   file, keeping it until a restart; or write the default file first, and the installer skips its config step.
   Example: the admin types 8080; the hotel answers on 17387 now and on 8080 after a restart.
5. Which config keys hold the orchestrator's address? `cms.host` and `cms.port`; or a new `reborn` section.
6. How does the orchestrator change the addresses the installer suggests? An installer option that sets what the forms
   show, still editable; or the admin types them; or the setting is rewritten after the installation. Example: the
   site step suggests `http://localhost:17387/housekeeping` in place of `:18465`.
7. In one process, do the settings refresh and the doubled session cleanup keep running? Yes, they stay in `New`, and
   holo-port 0051's line is amended; or a `StartRefresh()` that only the separate runners call.
8. One database handle, or one a program? One shared; or one each, which keeps today's parallel reads. Example: with
   one, a page of the site waits while the game saves.
9. Where does the orchestrator's logic live? All in `cmd/reborn/main.go`, about 80 lines, the user's file; or a
   `reborn.go` a test can reach, which `main` calls.
10. How does `make dev` work for it? Go hot reload on the built pages, `make frontends` for page changes, page work
    staying in the separate runners; a dev runner that proxies the Astro servers cannot serve both sites.
11. Do releases switch to the single binary? Yes, as the last task, once its browser suite passes; or three binaries
    and `reborn`.
12. A shutdown in order in the first version? No, as today, a later task; or yes, with new server and scheduler APIs.
    Example: Ctrl-C disconnects players without a logout.
13. Do the game's WebSockets keep their own ports? Yes; or `/client/info` and `/client/mus` on the mux now. Example:
    the site on `:17387`, the client on `:30000` and `:30001`.
