# Project Reborn

Project Reborn is a remake of Habbo Hotel as it was around 2008 — the classic Shockwave era (R26). The original virtual world experience: rooms, the navigator, friends list, the catalogue, clubs, and the rest of the original features.

The original Macromedia Shockwave client is replaced by a Godot reimplementation exported to HTML5. The server is written in Go.

> Early development. Most systems are incomplete or not yet started.

---

## Stack

- [Go 1.25.5+](https://go.dev/dl/) — server
- [SQLite](https://www.sqlite.org/) + [sqlc](https://sqlc.dev/) — database with type-safe generated queries
- [Godot 4](https://godotengine.org/download/) — client, exported to HTML5

Both `air` (hot reload) and `sqlc` are declared as Go tools in `go.mod` and do not need to be installed separately — `go mod tidy` will fetch them.

---

## Getting started

### 1. Fetch dependencies

```bash
make install
```

```bash
go mod tidy
```

### 2. Run the dev server

Runs `cmd/reborn` with hot reload via air. Rebuilds and restarts automatically on Go or template file changes.

```bash
make dev
```

```bash
go tool air
```

### 3. Run the CMS dev server

Runs the CMS app in isolation with hot reload. Only watches CMS-related files.

```bash
make cms
```

```bash
go tool air -c .air.cms.toml
```

### 4. Run the client dev server

```bash
make client
```

```bash
go run ./tools/dev/client
```

---

## Building

Compiles the binary to `./bin/main`.

```bash
make build
```

```bash
mkdir -p ./bin && go build -o ./bin/main ./cmd/habbo
```

---

## Database

The Go query code is generated from SQL with sqlc. Run this after changing any `.sql` files.

```bash
make sqlc
```

```bash
go tool sqlc generate
```

---

## Other tools

### Godot export presets

Generates `client/export_presets.cfg` based on the asset directories found under `client/`. Run this before exporting the Godot project.

```bash
make presets
```

```bash
go run ./tools/presets
```

### Figure preview dev server

Builds the Godot figurepreview export and serves it at `http://localhost:8081` with hot reload. Requires Godot to be installed and either on `PATH` as `godot` or set via the `GODOT_BIN` environment variable.

```bash
make figurepreview
```

```bash
go run ./tools/dev/figurepreview
```

---

## License

Not yet decided.
