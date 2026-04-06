# AGENTS.md - Project Reborn (Habbo Hotel Remake)

## Project Overview

Monorepo: Go 1.25.5 backend server + multiple client implementations. Habbo Hotel R26 (Shockwave era) remake.
Module: `github.com/kronothepenguin/project-reborn`

### Monorepo Structure

**Server Apps** (`internal/app/`):
- `game/` - Game server (protocol, transport, websocket)
- `cms/` - Web CMS (auth, pages, templates)
- `housekeeping/` - Admin dashboard
- `installer/` - Web installer
- `reborn/` - Main app orchestrator

**Client Projects**:
- `client/` - Godot 4 HTML5 client (primary)
- `apps/client/` - LingoScript → JavaScript translation (Vite)
  - See `apps/client/AGENTS.md` for translation workflow and conventions
  - See `apps/client/CAST-LOADING.md` for dynamic cast loading system
- `experimental/` - Legacy LingoScript translation (being migrated to `apps/client/`)

## Commands

### Development
```bash
make dev       # Dev server with hot reload (air)
make cms       # CMS dev server with hot reload
make client    # Godot client dev server
make install   # Fetch dependencies (go mod tidy)
```

### Build
```bash
make build     # Compile binary to ./bin/main
make sqlc      # Generate Go code from SQL (sqlc)
make presets   # Generate Godot export presets
make figurepreview  # Build/serve figure preview
```

### Testing
No test files exist yet. When added, use standard Go test commands:
```bash
go test ./...                          # Run all tests
go test ./internal/app/game/...        # Run tests in a package
go test ./... -run TestName -v         # Run a single test by name
```

### Linting/Formatting
No linter configured. Use Go standard tools:
```bash
go fmt ./...       # Format all Go files
go vet ./...       # Static analysis
go mod tidy        # Clean up dependencies
```

## Code Style

### Imports
- Standard library first, then third-party, then internal
- Internal imports use full module path: `github.com/kronothepenguin/project-reborn/internal/...`
- Blank imports for side-effect: `_ "github.com/mattn/go-sqlite3"`
- Alias snake_case Godot dir names: `hhentryinit "protocol/hh_entry_init"`

### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Packages | lowercase, single word | `game`, `storage`, `httpx` |
| Exported types | PascalCase | `Reborn`, `Session`, `Packet` |
| Unexported types | camelCase | `tcpConn`, `wsConn`, `registryImpl` |
| Exported funcs | PascalCase | `New()`, `NewHotel()`, `NewRegistry()` |
| Unexported funcs | camelCase | `createLoginRegistry()`, `resolveUser()` |
| Variables | camelCase | `httpServer`, `loginRegistry` |
| Constants | camelCase (NOT UPPER_SNAKE) | `cookieSession`, `cookieMaxAge` |
| Errors | `Err` prefix + PascalCase | `ErrCommandNotFound`, `ErrListenerNotFound` |
| Interfaces | `-er` suffix or descriptive | `Connection`, `Handler`, `Transport` |

### File Organization
- Standard Go layout: `cmd/`, `internal/app/`, `internal/pkg/`, `tools/`
- `internal/app/` - application layer (game, cms, housekeeping, installer, reborn)
- `internal/pkg/` - shared packages (dotenv, httpx, storage, tmpl, virtual)
- Files kept small (under 100 lines preferred)
- Protocol handlers in separate packages under `protocol/` with `Register(registry)` function

### Error Handling
- Errors returned, never panics (except truly exceptional cases)
- Sentinel errors as package-level variables: `var ErrNotFound = errors.New("...")`
- Early returns on error (guard clause pattern)
- Use `defer` for cleanup: `defer conn.Close()`, `defer r.mu.Unlock()`
- Log with `log/slog`: `session.Logger.Error("msg", slog.Any("error", err))`

### Concurrency
- `sync.RWMutex` for read-heavy shared state, `sync.Mutex` for write-heavy
- Lock/unlock with defer: `r.mu.Lock(); defer r.mu.Unlock()`
- Goroutines for connection handling: `go t.handler(&tcpConn{conn})`

### Types & Interfaces
- Heavy use of interfaces for abstraction (CommandRegistry, MessageRegistry, Connection, Transport)
- Struct embedding for composition: `type ServeMux struct { http.ServeMux }`
- Type aliases for function types: `type Middleware func(http.Handler) http.Handler`

### Database
- SQLite via `github.com/mattn/go-sqlite3`
- sqlc for type-safe queries (config: `sqlc.yaml`, schema: `internal/pkg/storage/schema`)
- Run `make sqlc` after modifying SQL queries

### Logging
- Use `log/slog` (standard library)
- Packet logging: `session.Logger.Info("<<", slog.Int("cmd", int(p.Command)), slog.String("msg", p.Message.String()))`

## Architecture Notes

- Main app orchestrator: `internal/app/rebbo/reborn.go`
- Game server: `internal/app/game/` (protocol, transport, websocket)
- CMS: `internal/app/cms/` (auth, pages, templates)
- Hotel/Habbo management via `Hotel` struct with `sync.RWMutex` for thread safety
- Each protocol package has a `Register(registry)` function for command registration
