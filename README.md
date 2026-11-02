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
│   ├── store/                     # persistence infrastructure: SQLite + sqlc-generated DB layer (Go)
│   ├── scheduler/                 # runs timed tasks inside a process (Go)
│   ├── virtual/                   # domain types (Go)
│   └── shared/                    # ansi, dotenv, httpx, tmpl utilities (Go)
├── apps/                          # thin executables (process, port, entrypoint)
│   ├── reborn/                    # orchestrator, planned: one binary running every app
│   └── ...
└── Makefile                       # generic workspace targets
```

Packages own the implementation — including the app packages (cms, housekeeping, installer, server). Apps are thin runners: they import a package and execute it as a singleton. For an HTTP app, the package exposes `Mount`/`Routes` against an `http.ServeMux` and the app creates the `http.Server`. `apps/reborn`, the orchestrator, will import every app and serve all of them on one HTTP server. Its old implementation was removed and the new one is not planned yet; for now each app runs in isolation on its own port.

---

## Getting Started

### 1. Fetch dependencies

```bash
make install        # every project's folders and dependencies, and the tools
```

Each project also has its own `make install`, the minimum needed to develop and run it.

### 2. Run an app's dev server

Each app owns its own `Makefile` with app-specific targets.

```bash
cd apps/cms && make dev
```

Web apps have two modes:

- **dev** — `/packages/<app>/cmd/dev` starts the Go HTTP server and the Astro dev server; the Go server reverse-proxies HTML and scripts from the Astro dev server.
- **build** — `Astro build → embed → Go build`; the web app embeds its Astro `dist` output into the Go binary.

---

## Workflow

- Sequential work goes on `main`, one commit per finished task.
- Parallel work, such as agents building housekeeping beside the CMS, goes on feature branches, one for each line of work,
  and is merged into `main` once it is done and verified.

---

## Building

Each app builds on its own; its `README.md` has the steps.

```bash
pnpm --filter @project-reborn/cms build
go build -o ./apps/cms/tmp/cms ./apps/cms/cmd/cms
```

---

## Releases

Pushing a tag like `v0.1.0` publishes a GitHub release, once every gate has passed:

- `reborn-<tag>-linux-amd64.tar.gz` and `reborn-<tag>-linux-aarch64.tar.gz`, each with
  `cms`, `housekeeping` and `installer`;
- `SHA256SUMS`.

To try one, unpack it in an empty folder, run `./installer` and follow it at
`http://localhost:17306`. Then stop it and run `./cms` and `./housekeeping` from the
same folder, which now holds `config.json` and the database.

`make release VERSION=v0.1.0` builds the same archives into `release/`.

---

## Testing

```sh
make gates          # formatting, vet and tests of every module, frontends, generated code and docs
make e2e            # real Chromium against the production binaries, see tests/e2e
```

GitHub Actions runs both on every push to `main` and on pull requests.

---

## Database

The persistence infrastructure lives in `packages/store/`: it owns the SQLite file, applies the declared schemas on every open, and exposes typed operations generated from SQL with sqlc. Run the generator after changing any `.sql` files.

```bash
cd packages/store && go tool sqlc generate
```

New persisted data is added with the `adding-data-persistence` skill and documented in the OKF bundle under `packages/store/knowledge/` with the `documenting-with-okf` skill.

---

## License

Not yet decided.