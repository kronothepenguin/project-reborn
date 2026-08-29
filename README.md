# Project Reborn

Project Reborn is a remake of Habbo Hotel as it was around 2008 — the classic Shockwave (Macromedia Director) era (R26): rooms, navigator, friends, catalogue, clubs, and the rest.

The client is a JavaScript reimplementation of the Shockwave client: a director runtime (shockwave player) that runs the translated Lingo movies. The server, CMS, housekeeping, installer, and orchestrator are Go.

> Early development. Most systems are incomplete or not yet started.

---

## Stack

- [Go 1.26.4+](https://go.dev/dl/) — Go workspace, no root module
- [SQLite](https://www.sqlite.org/) + [sqlc](https://sqlc.dev/) — type-safe generated queries
- [pnpm](https://pnpm.io/) — all JavaScript, including the Vite client
- [Astro](https://astro.build/) + [Tailwind](https://tailwindcss.com/) — static HTML for CMS/housekeeping, embedded into the Go binaries
- [Director runtime](packages/director/) — Shockwave player reimplementation (`@project-reborn/director`)

`air`, `sqlc`, and Astro are declared as `tool` directives in the relevant `go.mod` files — no global installs needed.

---

## Project Layout

```
project-reborn/
├── go.work                        # Go workspace (committed)
├── pnpm-workspace.yaml            # pnpm workspace
├── packages/                      # implementation (models, logic, handlers)
│   ├── client/                    # JavaScript client (@project-reborn/client-r26)
│   ├── director/                  # director runtime (@project-reborn/director)
│   ├── storage/                   # sqlc-generated DB layer (Go)
│   ├── virtual/                   # domain types (Go)
│   └── shared/                    # ansi, dotenv, httpx, tmpl utilities (Go)
├── apps/                          # thin executables (process, port, entrypoint)
│   ├── reborn/                    # orchestrator: imports everything
│   └── ...
└── Makefile                       # generic workspace targets
```

Packages own the implementation — including the app packages (cms, housekeeping, installer, server). Apps are thin runners: they import a package and execute it as a singleton. For an HTTP app, the package exposes `Mount`/`Routes` against an `http.ServeMux` and the app creates the `http.Server`. `apps/reborn` imports every app and serves all of them on one HTTP server; each app can also be run in isolation on its own port (e.g. cms and housekeeping separately in dev).

---

## Getting Started

### 1. Fetch dependencies

```bash
make install        # go work sync && pnpm install
```

### 2. Run the dev server

```bash
make dev            # reborn with air (hot reload)
```

### 3. Run an app's dev server

Each app owns its own `Makefile` with app-specific targets.

```bash
cd apps/reborn && make dev
```

Web apps have two modes:

- **dev** — `/packages/<app>/cmd/dev` starts the Go HTTP server and the Astro dev server; the Go server reverse-proxies HTML and scripts from the Astro dev server.
- **build** — `Astro build → embed → Go build`; the web app embeds its Astro `dist` output into the Go binary.

---

## Building

```bash
make build          # compiles ./bin/main from apps/reborn/cmd
```

---

## Database

The Go query code in `packages/storage/` is generated from SQL with sqlc. Run this after changing any `.sql` files.

```bash
cd packages/storage && make generate
```

---

## License

Not yet decided.