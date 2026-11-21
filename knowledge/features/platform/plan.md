---
type: Plan
title: "Platform: reborn runs the whole hotel: how"
description: Four runners share one database, config.json and CI; packages/reborn runs every program on one mux, the installer moves under /installer/, settings come from the store, and releases ship every runner.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `apps/cms`, `apps/housekeeping`, `apps/installer`, `apps/server` | Four runners, each its own process and port, from the repository root in development |
| `packages/store` | `store.Open` creates a new database with every update; `store.FromConfig` opens the one `config.json` names |
| `packages/config` | `cms.host`, `housekeeping.host` and the `proxy` section, read at start |
| `packages/config`, `packages/installer`, `packages/housekeeping` | The `reborn` section: `config.Reborn.Host` and `Port`, defaults `localhost` and 16416; the installer writes it; housekeeping's update page offers the two keys to an older `config.json` |
| `packages/auth` | `RealIP`, in front of the CMS and housekeeping |
| `packages/cms`, `packages/housekeeping` | `Mount` wraps every route with `RealIP` and cross-origin protection |
| `packages/installer`, `apps/installer` | Under `/installer/`, its two forms, `Listener`, no done page; `Mount` protects its routes, and the runners redirect `/` to `/installer/` |
| `packages/reborn`, `apps/reborn` | Runs an installed hotel: one mux, one database handle, the game's listeners ([0003](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md)); the production runner `apps/reborn/cmd/reborn` |
| `packages/server`, `apps/server` | Only the game listeners on 30000 and 30001; the unused HTTP listener on 15445 is gone |
| `.github/workflows`, `Makefile` | `ci.yml` runs `make check` and `make e2e`; `release.yml` runs them on a tag, then `make release` |
| `tests/e2e` | The browser suites, run by `make e2e` |
| `packages/settings` and every program | Settings read from the store, no refresh, `virtual/settings` gone ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)) |
| `packages/installer` | `Installed` and `WaitForInstall` on the installer, in place of `Done` and the function `Installed` |
| `packages/reborn` | One Astro project that builds one `dist` for the three sites; `New` builds the site, housekeeping, the installer and the game; `MountInstaller`, `Mount`, `Start`, `Stop`; `Run` and the HTTP server go ([0015](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md)) |
| `apps/reborn` | The HTTP server, its replacement after the installation and its move to a new address; the wait for the installation and for Ctrl-C |
| `apps/server` | Ctrl-C and SIGTERM stop the game with `Stop`, then the database closes |

Planned:

| Project | Part |
| --- | --- |
| `tests/e2e` | A browser suite for reborn |
| releases | reborn and the four separate programs ([0008](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md)) |

## reborn's new shape

From [0015](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md). On 2026-11-20 the user approved the two
mount functions ("ok, if there is not a better way"), `apps/reborn/internal/web` ("ok") and the two options ("yes"),
and asked of the wait for the installation: "is there a better alternative now that you know this is a sequential
steps?" The master proposed the blocking `WaitForInstall` below in place of a channel the runner selects on, and the
user: "yeah, much better to use `WaitForInstall`. Is this good for standalone `packages/installer` too?" Then "yes" to
the same pair on the installer, with reborn's two functions passing through to it.

```go
// packages/reborn
// New builds the site, housekeeping, the installer and the game on db, injects
// the game into the two sites and mover into the installer.
func New(db *sql.DB, mover installer.Listener, opts ...Option) (*Reborn, error)

func WithResolver(r astro.Resolver) Option // the pages of reborn's dist, or of its dev server
func WithStatic(h http.Handler) Option     // the files of reborn's dist, or of its dev server

// Installed reports whether the administrator exists.
func (r *Reborn) Installed() bool

// WaitForInstall returns once the administrator exists, or with ctx's error when ctx ends first.
func (r *Reborn) WaitForInstall(ctx context.Context) error

// MountInstaller registers the installer, and sends every other page to /installer/.
func (r *Reborn) MountInstaller(mux *http.ServeMux)

// Mount registers the site and housekeeping.
func (r *Reborn) Mount(mux *http.ServeMux)

func (r *Reborn) Start(ctx context.Context) error // the game opens its doors
func (r *Reborn) Stop(ctx context.Context) error  // players out, doors closed
```

```go
// packages/installer
func (i *Installer) Installed() bool                          // the administrator exists
func (i *Installer) WaitForInstall(ctx context.Context) error // returns once it exists, or when ctx ends
```

`Done()` and the function `installer.Installed(ctx, db)` go: reborn was their only caller. The installer's own runner
keeps serving after the installation and calls neither.

```go
// apps/reborn/cmd/reborn/main.go
db := store.FromConfig()
web := web.New(cfg.Reborn.Host, cfg.Reborn.Port) // the runner's HTTP server; it implements installer.Listener
r, err := reborn.New(db, web, reborn.WithResolver(pages), reborn.WithStatic(files))

if !r.Installed() { // the first time
    mux := http.NewServeMux()
    r.MountInstaller(mux)
    web.Serve(mux) // the installer's server
    if err := r.WaitForInstall(ctx); err != nil {
        return // Ctrl-C before the installation ended
    }
}

mux := http.NewServeMux()
r.Mount(mux)
web.Serve(mux) // closes the installer's server and starts the site's
if err := r.Start(ctx); err != nil {
    log.Fatalln(err)
}
<-ctx.Done() // Ctrl-C or SIGTERM
web.Shutdown(tenSeconds)
r.Stop(context.Background())
db.Close()
```

- `web` lives in `apps/reborn/internal/web`, shared by `reborn` and `reborn-dev`. Run alone, the installer stays on its
  port and moves nothing, so it shares none of this code.
- `web.Serve` starts the new server on the open listener before it shuts the old one down, so the browser's request for
  `/` right after "Create administrator" finds a server.
- Before the installation, pages go to `/installer/` and files pass, the dev server's own paths included, as the user
  asked on 2026-11-15 (see Decisions).

How programs tell the game of a live change is
[0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md); its first service is built in
[habbos](/features/habbos/spec.md), and each feature adds its own.

# Decisions

- [Runners run from the repository root in development](/decisions/holo-port/0027-runners-run-from-the-root.md) —
  `make dev` starts air from the root, so every runner reads and writes the root `config.json`.
- [Trusted reverse proxies in config.json](/decisions/holo-port/0028-trusted-proxies-in-config.md) — A `proxy` section,
  off by default, lets the runners take the client's address from `X-Forwarded-For` behind a listed proxy.
- [The CMS address comes from config.json](/decisions/holo-port/0037-cms-host-in-config.md) — The CMS runners listen on
  `cms.host` and `cms.port`; the installer keeps its fixed address.
- [Seeds are updates, and a new database gets every update](/decisions/holo-port/0068-seeds-are-updates.md) — Every
  program works on an empty database, which it creates with every update; `packages/store` holds every schema.
- [The backend template of tools/create keeps its HTTP
  server](/decisions/reborn/0014-the-backend-template-keeps-its-http-server.md) — The game server's HTTP listener on
  15445 is gone, and the template keeps its own.
- [reborn runs the hotel in one process, and the separate programs
  stay](/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md) — apps/reborn runs the installer, the site,
  housekeeping and the game server in one process on one mux with one database handle, its logic in packages/reborn and
  its address in a new reborn section of config.json; the standalone runners stay, for work on one program and for
  testing how programs talk.
- [Inside reborn the installer lives under /installer/, moves the hotel to the address it is given, and goes once
  installed](/decisions/reborn/0004-the-installer-inside-reborn.md) — reborn serves the installer under /installer/
  until an administrator exists, asks one host and port for the whole site and moves its listener to them at once, and
  answers 404 under /installer/ once installed; run alone the installer keeps today's form; the done page goes.
- [The game hears of live changes through
  services](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) — Changes the game must show at once
  reach it through small contracts in packages/services, injected into the apps after New; reborn passes in-memory
  implementations, programs run apart call the game's /api/ over HTTP with a secret; calls carry ids only and store
  nothing.
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md) — The CMS, housekeeping, the installer, auth
  and the game server read each setting with a sqlc query through packages/settings, which returns the declared default
  when there is no row; virtual/settings and every refresh go, and the game checks for waiting database updates on use.
- [The runner owns reborn's HTTP server, and reborn builds its
  programs](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md) — The runners of apps/reborn create, close
  and replace the HTTP server; packages/reborn builds the site, housekeeping, the installer and the game, mounts them on
  a mux it receives and has Start and Stop for the game. It replaces
  [reborn stops in order](/decisions/reborn/0007-reborn-stops-in-order.md).
- [Lifecycle names come in pairs, and the scheduler has no
  stop](/decisions/reborn/0016-lifecycle-names-come-in-pairs.md) — Start with Stop, Init with Destroy, Open with Close;
  a package that only mounts routes has neither, and the scheduler's tasks run until the process ends.
- [Releases ship reborn and the four separate
  programs](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md) — Each release archive holds
  reborn and the standalone CMS, housekeeping, installer and game server, so that an administrator chooses one binary or
  several.
- [reborn's dev runner proxies one Astro dev server for every site, after a spike proves
  it](/decisions/reborn/0009-one-dev-server-for-reborn.md) — A dev-only Astro project in packages/reborn serves the
  CMS's pages at /, housekeeping's at /housekeeping/ and the installer's at /installer/ from one dev server, so that
  reborn-dev proxies it as the standalone dev runners proxy theirs; a spike proves it first.
- Replaced on 2026-11-20 by [0015](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md): reborn ran the
  programs its runner built. `apps/reborn/cmd/reborn/main.go` opened the database and built the
  CMS, housekeeping, the installer and the game with each package's own constructor and options, as the CMS's runner
  does; `reborn.New(cfg, db, c, h, i, g)` mounts them on one HTTP server and starts the game. reborn has no option of
  its own. The user, on 2026-11-15, of the `WithCMS`, `WithHousekeeping` and `WithInstaller` options that task 03
  built: "i hate 'WithCMS' and 'WithHousekeeping' looks like you took architecture decisions", "reborn just use the
  other projects", and "Yes, that is it" to this shape.
- Inside reborn the installer asks a host and a port only. The runner opens the database at start, so the database is
  the one `config.json` names, `habbo.db` by default. Run alone, the installer asks the path as before. The user chose
  "Host and port only". It replaces the database path of the one-address form in
  [0004](/decisions/reborn/0004-the-installer-inside-reborn.md).
- The installer gets its listener through `Inject`: `i.Inject(installer.Services{Listener: r})` after `New` and before
  `Mount`, as the CMS gets its services. An option is only for what a runner injects by mode. The user chose "`Inject`,
  like the services"; `WithListener` goes.
- The installer moves first, then saves. A move that fails saves nothing, shows its error in the form, and the step
  takes another address. The user chose "Move first, then write".
- The installer takes the database as an argument: `installer.New(ctx, db, opts...)`. reborn's runner passes the
  database it opened, so the whole hotel works on one handle; the installer's own runners pass `nil`, and the installer
  creates the database in its config step. The user chose "An argument, nil when run alone".
- `packages/config` saves a section through a typed function, `config.SaveReborn(r reborn.Reborn) error`, in place of
  `config.Save(section string, value any)`. The user chose "A typed function per section": config is static types.
- `packages/settings` checks and lists with the store: `settings.Validate(ctx, q, candidates)` reads the stored
  partner of a rule, so housekeeping keeps its "Settings not saved" form, and `settings.Declared(ctx, q)` returns every
  setting with its current value from one query. The user chose "It reads the stored partner" and "One call that reads
  them all". A read trusts the rows: the rules that tie two settings are checked on save
  ([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).
- Before the hotel is installed, reborn sends Go's routes to the installer and lets files through. The user: "everything
  of go routing goes to /installer/ special routes like /@vite/* and frontend stuff is passby, we can do this by
  checking in the "/" handler the path and the mux, if mux has it registered then redirect to /installer/, if it is an
  asset or vite then passby."
- A trusted proxy's host and scheme replace the request's own. `auth.RealIP`, which already replaces the address of a
  request from a trusted proxy with the visitor's, also sets its host from `X-Forwarded-Host` and its scheme from
  `X-Forwarded-Proto`, so every handler sees the request as the visitor sent it, and the client page builds its
  addresses from it. The user chose "auth's `RealIP` fixes the request", with no new function.

# Notes

- `release.yml` takes tags of digits and dots only, so the version is safe in a shell command without an environment
  variable. Publishing uses `softprops/action-gh-release`, which takes its token by itself.
- The first release built 17.5 MB for amd64 and 16.2 MB for aarch64. The aarch64 binaries were built but not run, since
  no such machine was available.
- `actionlint` was not run on the workflows: fetching it would have run code from the internet.
- The game reads its settings from the store since 2026-11-18. One chat line, its busiest reader, went from 0.12 ms to
  0.21 ms (`BenchmarkChat` in `packages/server/internal/r26`), about 4,700 lines a second on one core. The user chose
  "Fine, keep reading the database": no cache.
- The spike of 2026-11-20 proved one `dist` for reborn (branch `reborn-dist-spike`, unmerged). `astro build` in
  `packages/reborn` writes the 70 pages of the three sites, with the three sites unchanged. The site's pages match
  their own build apart from hashed file names; housekeeping's and the installer's load their styles and scripts from
  `/_astro/` at the root. The three stylesheets are byte for byte today's. The build takes about 4 seconds beside 8.4
  for the three, and `dist` holds 9.2 MB beside 9.3. reborn's project needs the shared components as a dependency, and
  a step after the build that copies housekeeping's and the installer's `public/` under their base and moves
  `housekeeping.html` and `installer.html` to `index.html` in their folders.
- The installer's pages load one file outside `/installer/`: their stylesheet under `/_astro/`. The server for the
  installer alone serves the files too.
- Each site keeps its own build for its own runner.
- Task 18 built reborn's new shape on 2026-11-20. From an empty folder: the installer, "Create administrator", then the
  site on the same connection; Ctrl-C with a habbo inside sent the closing notice, saved its last time online at the
  signal, closed the doors 5 seconds later and closed the database. The game's own program does the same on SIGTERM.
- `apps/reborn/internal/web` keeps one open listener and hands each connection to the current `http.Server`. A second
  `Serve` starts the new server first and retires the old one: it takes no new connection, answers the next request of
  each open one with `Connection: close`, and ends when none is left. `http.Server.Shutdown` right at the swap dropped
  connections that were accepted and not yet read.
- A listener that fails later is logged; nothing ends the program for it.
- `run` and `shutdown` are written in both runners' `main.go`.
- A checkout needs `pnpm install` and `make frontends` once after this change: `packages/reborn` embeds its `dist`.
