# AGENTS.md - Project Reborn (Habbo Hotel Remake)

## Project Overview

Monorepo: Go backend server + multiple client implementations. Habbo Hotel R26 (Shockwave era) remake.
Module: `github.com/kronothepenguin/project-reborn`

### Monorepo Structure

**Server Apps** (`internal/app/`):
- `cms/` - Web CMS (auth, pages, templates)
- `game/` - Game server (protocol, transport, websocket)
- `housekeeping/` - Admin dashboard
- `installer/` - Web installer
- `reborn/` - Main app orchestrator

**Client Projects**:
- `client/` - Godot 4 HTML5 client (primary)
- `apps/client/` - LingoScript → JavaScript translation (Vite)

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

### JavaScript/Client (pnpm)
The `apps/client/` project uses **pnpm** for package management (not npm or yarn).

```bash
cd apps/client
pnpm install       # Install dependencies
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm test          # Run tests (vitest)
```

**Important**: Always use `pnpm` instead of `npm` or `yarn` for JavaScript dependencies.
