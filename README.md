# Project Reborn

Project Reborn is a remake of Habbo Hotel as it was around 2008 — the classic Shockwave era (R26). The original virtual world experience: rooms, the navigator, friends list, the catalogue, clubs, and the rest of the original features.

The original Macromedia Shockwave client is replaced by a Godot reimplementation exported to HTML5. The server is written in Go.

> Early development. Most systems are incomplete or not yet started.

---

## Stack

- [Go 1.26.4+](https://go.dev/dl/) — server (Go workspace, no root module)
- [SQLite](https://www.sqlite.org/) + [sqlc](https://sqlc.dev/) — database with type-safe generated queries
- [Godot 4](https://godotengine.org/download/) — client, exported to HTML5 (standby)
- [Vite](https://vitejs.dev/) + [pnpm](https://pnpm.io/) — JavaScript client
- [LingoScript → JS](packages/director/) — Director runtime shim (`@project-reborn/director`)

Both `air` (hot reload) and `sqlc` are declared as `tool` directives in the relevant `go.mod` files and do not need to be installed separately — `go mod tidy` will fetch them.

---

## Project Layout

```
project-reborn/
├── go.work                        # Go workspace (committed)
├── pnpm-workspace.yaml            # pnpm workspace
├── apps/                          # applications (Go + JS)
│   ├── cms/                       # web CMS (Go)
│   ├── reborn/                    # main orchestrator + cmd entrypoint (Go)
│   ├── server/                    # game server: protocol, transport (Go)
│   ├── installer/                 # web installer (Go)
│   ├── housekeeping/              # admin dashboard (Go, placeholder)
│   └── client/                    # Vite JS client (@project-reborn/client-r26)
├── packages/                      # shared packages
│   ├── storage/                   # sqlc-generated DB layer (Go)
│   ├── virtual/                   # domain types (Go)
│   ├── shared/                    # ansi, dotenv, httpx, tmpl utilities (Go)
│   └── director/                  # LingoScript → JS runtime (@project-reborn/director)
├── client/                        # Godot 4 HTML5 client (standby)
│   └── tools/                     # Godot dev tooling (separate Go module)
├── web/  scripts/  openspec/  docs/
└── Makefile                       # generic workspace targets
```

Each Go app follows the same layout: `go.mod`, `pkg/<name>/` (public package), `internal/` (private code), `cmd/` (entrypoint when applicable), `tools/dev/` (dev servers), `Makefile`, and `.air.toml` (hot reload config).

---

## Getting Started

### 1. Fetch dependencies

```bash
make install
```

Runs `go work sync && pnpm install`.

### 2. Run the dev server

Runs the `reborn` app with hot reload via air. Rebuilds and restarts on Go or template file changes.

```bash
make dev
```

### 3. Run an app's dev server

Each app owns its own `Makefile` with app-specific targets.

```bash
cd apps/reborn && make dev      # reborn with air
cd apps/cms && make dev         # CMS dev server (go run tools/dev)
```

### 4. Run the JS client

```bash
pnpm --filter @project-reborn/client-r26 dev
# or
cd apps/client && pnpm dev
```

### 5. Run the Godot client dev server (standby)

```bash
cd client && go run ./tools/dev/client
```

---

## Building

Compiles the binary to `./bin/main` from `apps/reborn/cmd`.

```bash
make build
```

---

## Database

The Go query code in `packages/storage/` is generated from SQL with sqlc. Run this after changing any `.sql` files.

```bash
cd packages/storage && make generate
```

---

## Other Tools

All Godot-related tooling lives under `client/tools/` (separate Go module).

### Godot export presets

Generates `client/export_presets.cfg` based on the asset directories under `client/`. Run before exporting the Godot project.

```bash
cd client && go run ./tools/presets
```

### Figure preview dev server

Builds the Godot figurepreview export and serves it at `http://localhost:8081` with hot reload. Requires Godot on `PATH` as `godot` or set via `GODOT_BIN`.

```bash
cd client && go run ./tools/dev/figurepreview
```

### Websocket test server

```bash
cd client && go run ./tools/ws
```

---

## License

Not yet decided.
