---
type: Go Package
title: Run
description: reborn.New builds the site, housekeeping, the installer and the game; MountInstaller and Mount register them on the runner's mux; Start and Stop open and close the game's doors.
---

# Run

`packages/reborn` builds the hotel and mounts it on a mux it receives; its runner owns the HTTP server
(`knowledge/decisions/reborn/0015-the-runner-owns-reborns-http-server.md`).

```go
func New(db *sql.DB, mover installer.Listener, opts ...Option) (*Reborn, error)
func WithResolver(r astro.Resolver) Option
func WithStatic(h http.Handler) Option

func (r *Reborn) Installed() bool
func (r *Reborn) WaitForInstall(ctx context.Context) error
func (r *Reborn) MountInstaller(mux *http.ServeMux)
func (r *Reborn) Mount(mux *http.ServeMux)
func (r *Reborn) Start(ctx context.Context) error
func (r *Reborn) Stop(ctx context.Context) error
```

# New

- `New` builds the CMS first, so its automatic updates run before the game reads the database, then housekeeping, the
  installer and the game, all on `db`.
- It injects the game, which satisfies `services.Habbos` and `services.Hotel`, into the CMS and housekeeping, and
  `mover` into the installer as its `Listener`.
- It returns the installer's error when the installation in the working directory cannot be read.
- `WithResolver` and `WithStatic` give the pages and files of reborn's one `dist`, or of its dev server
  ([Dev server](dev-server.md)). Each site gets them under its base: the site at the root, housekeeping under
  `housekeeping`, the installer under `installer`. Housekeeping's `index.html` resolves as `housekeeping/index.html`,
  and its `/favicon.svg`, which it strips of `/housekeeping`, reaches the file handler as `/housekeeping/favicon.svg`.
- `DistFS` embeds `dist/`, which `pnpm --filter @project-reborn/reborn build` writes and `make frontends` builds.

# The installation

- `Installed` and `WaitForInstall` pass through to the installer's: an administrator exists, or the wait returns once
  one does. `WaitForInstall` logs the absolute paths of `config.json` and of the database when it returns.
- `MountInstaller` registers the installer at `/installer/` and a root handler. Before the administrator exists, the
  root handler asks a mux of the site and housekeeping which pattern takes the request
  (`(*http.ServeMux).Handler`). A route a program registered redirects to `/installer/` with 303. A request that falls to
  a static handler, the site's `/` or housekeeping's `/housekeeping/`, is served: the installer's stylesheet under
  `/_astro/`, and the dev server's own paths such as `/@vite/client`.
- Once the administrator exists, the root handler serves the site and housekeeping. A request that reaches the
  installer's server between "Create administrator" and the runner's new server finds the site.
- `Mount` registers the site and housekeeping. `/installer` and every path under `/installer/` answer 404, so the
  installer's built pages in `dist` stay out of reach.

# The game

- `Start` opens the game's doors on `server.info` and `server.mus`, unless `game.closed` or `site.maintenance` is on.
  It returns the game's error, such as a port in use.
- `Stop` logs each player out with its last time online saved, and closes the doors. It takes about 5 seconds while
  anybody is connected.
- Under reborn, `cms.host`, `cms.port`, `housekeeping.host` and `housekeeping.port` go unused.

# Tests

- `TestMain` builds one installed hotel for the package, in a folder of its own: its site and housekeeping on an
  `httptest` server, its game on free ports. `config.Get` loads `config.json` once per process. Each test makes habbos
  with names of its own.
- A new hotel is built on an empty database of its own, served by an `httptest` server whose handler the test replaces,
  as the runner replaces its server.
- `habbos_test.go` speaks R26 to the game over a WebSocket with a small client of its own.
- The HTTP server, its replacement and the move to a new address are tested in `apps/reborn/internal/web`.
