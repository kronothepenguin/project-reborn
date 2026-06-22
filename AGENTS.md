# AGENTS.md - Project Reborn (Habbo Hotel Remake)

## Project Overview

Habbo Hotel R26 (Shockwave era) remake. Go backend, JS client, Godot client (standby).

Go workspace (`go.work`) + pnpm workspace (`pnpm-workspace.yaml`). No root Go module.

### Go Workspace (`go.work`)

- `apps/cms/` - Web CMS (auth, pages, templates)
- `apps/housekeeping/` - Admin dashboard (placeholder)
- `apps/installer/` - Web installer
- `apps/reborn/` - Main app orchestrator + `cmd/` entrypoint
- `apps/server/` - Game server (protocol, transport, registry)
- `packages/shared/` - Shared Go utilities: `ansi/`, `dotenv/`, `httpx/`, `tmpl/`
- `packages/storage/` - sqlc-generated DB layer
- `packages/virtual/` - Domain types (Habbo, Hotel, Room, Navigator, etc.)

### pnpm Workspace (`pnpm-workspace.yaml`)

- `apps/client/` - Vite + JS client (`@project-reborn/client-r26`, R26 first; future versions get sibling folders)
- `packages/director/` - LingoScript → JS runtime + API shim (`@project-reborn/director`)

### Godot (standby)

- `client/` - Godot 4 HTML5 client at repo root
- `client/tools/` - Separate Go module for Godot dev tooling: `build/`, `dev/{client,figurepreview}/`, `presets/`, `ws/`

### Per-App Layout Convention

```
apps/<name>/
├── go.mod
├── Makefile          # app-specific targets (dev, build, etc.)
├── .air.toml         # hot reload config (when applicable)
├── cmd/              # entrypoint (when applicable)
├── pkg/<name>/       # public app package
├── internal/         # app-private code (templates, validator, etc.)
└── tools/dev/        # app-specific dev servers
```

## Commands

### Root (`Makefile`)

Generic workspace-level targets.

```bash
make install    # go work sync && pnpm install
make dev        # run reborn app with air (cd apps/reborn && go tool air)
make build      # build ./bin/main from apps/reborn/cmd
```

### Per-App

Each app owns its Makefile for dev/build targets.

```bash
cd apps/reborn && make dev          # reborn with air
cd apps/cms && make dev             # CMS dev server (go run tools/dev)
```

### Packages

```bash
cd packages/storage && make generate    # sqlc generate
```

### JavaScript/Client (pnpm)

```bash
pnpm install                           # install all workspace deps
pnpm --filter @project-reborn/client-r26 dev     # Vite dev server
pnpm --filter @project-reborn/client-r26 build   # production build
pnpm --filter @project-reborn/client-r26 test    # vitest
# or from app dir:
cd apps/client && pnpm dev
```

### Godot Tools (`client/tools/`)

```bash
cd client && go run ./tools/dev/client          # Godot client dev server
cd client && go run ./tools/dev/figurepreview   # figurepreview dev server
cd client && go run ./tools/presets             # generate export_presets.cfg
cd client && go run ./tools/ws                  # websocket test server
```

### Go (workspace-wide)

No root module. Run per module or use workspace:

```bash
go work sync                       # sync workspace
go test ./...                      # from a module dir, tests that module
go vet ./...                       # from a module dir
go fmt ./...                       # from a module dir
```

## Conventions

- Go module paths mirror location: `github.com/kronothepenguin/project-reborn/{apps,packages,client/tools}/<name>`
- JS package scope: `@project-reborn/<name>`
- Use `pnpm`, never `npm` or `yarn`
- `air` and `sqlc` declared as `tool` directives in relevant `go.mod` files — no global install needed
- `go.work` committed; `go.work.sum` gitignored
