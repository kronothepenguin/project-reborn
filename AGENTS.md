# AGENTS.md — Project Reborn (Habbo Hotel Remake)

Habbo Hotel R26 (Shockwave era) remake. JavaScript client, Go backend.
The project constitution lives at `.specify/memory/constitution.md` and
prevails on conflict. Follow it: defined-before-built, no silent
interpretation, spec-driven development, KISS, YAGNI, SOLID.

## Architecture

Go workspace (`go.work`, no root module) + pnpm workspace
(`pnpm-workspace.yaml`).

- `packages/` — implementation: models, logic, handlers. Includes the
  app packages (client, cms, housekeeping, installer, server) and shared
  packages (storage = sqlc DB layer, virtual = domain types, shared =
  ansi/dotenv/httpx/tmpl, director = director runtime).
- `apps/` — thin executables. An app imports a package and runs it as a
  singleton: the package exposes `Mount`/`Routes` over an
  `http.ServeMux`, the app creates the `http.Server`.
- `apps/reborn/` — orchestrator. Imports every app and serves all of
  them on one HTTP server; each app can also be run in isolation on its
  own port.

Web apps have two modes:

- **dev** — `/packages/<app>/cmd/dev/main.go` starts the Go HTTP server
  and the Astro dev server; the Go server reverse-proxies HTML and
  scripts from the Astro dev server.
- **build** — `Astro build → embed → Go build`. A Go file in the app
  embeds the Astro `dist` folder.

## Commands

### Root (`Makefile`)

```bash
make install    # go work sync && pnpm install
make dev        # reborn with air (cd apps/reborn && go tool air)
make build      # build ./bin/main from apps/reborn/cmd
```

### Per-App

```bash
cd apps/reborn && make dev          # reborn with air
```

### Packages

```bash
cd packages/storage && make generate    # sqlc generate
```

### JavaScript (pnpm)

```bash
pnpm install                                    # install all workspace deps
pnpm --filter @project-reborn/client-r26 dev     # Vite dev server
pnpm --filter @project-reborn/client-r26 build   # production build
pnpm --filter @project-reborn/client-r26 test    # vitest
```

### Go (workspace-wide)

No root module. Run per module:

```bash
go work sync                       # sync workspace
go test ./...                      # from a module dir
go vet ./...                       # from a module dir
go fmt ./...                       # from a module dir
```

## Conventions

- Go module paths mirror location: `github.com/kronothepenguin/project-reborn/{apps,packages}/<name>`
- JS package scope: `@project-reborn/<name>`
- Use `pnpm`, never `npm` or `yarn`
- `air` and `sqlc` declared as `tool` directives in relevant `go.mod` files — no global installs
- `go.work` committed; `go.work.sum` gitignored
- Never log or commit secrets