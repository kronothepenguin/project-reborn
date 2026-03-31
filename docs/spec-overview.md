# Project Reborn — Overview Specification

**Status:** WIP — early development
**Module:** `github.com/kronothepenguin/project-reborn`
**Author:** kronothepenguin

---

## What Is Project Reborn

Project Reborn is a faithful server-side remake of Habbo Hotel revision R26, the 2008-era build of the classic browser-based virtual world. It reimplements the original network protocol, game logic, and web presence in a modern, self-hostable stack using Go (server) and Godot 4 (client).

The target audience is private community operators who want to run a period-accurate Habbo R26 experience on their own hardware.

---

## Goals

- Faithful recreation of R26 gameplay behaviour — rooms, navigation, friend lists, catalogue, clubs, etc.
- Modern implementation stack: Go for the server, Godot 4 exported to HTML5 for the client.
- Self-hostable: single machine, no external services required.
- Single binary (`reborn`) that wires up all server-side bounded contexts.
- Godot HTML5 client served from the same HTTP server as the CMS.
- SQLite database for zero-dependency persistence; no separate DB server required.

---

## Non-Goals

- Not a clone of modern (post-2010) Habbo Hotel — R26 era only.
- Not a cloud SaaS or managed hosting product.
- Not a mobile application.
- Not a pixel-perfect asset recreation — assets are sourced externally.

---

## Bounded Contexts

The server is organised as five independent applications under `internal/app/`:

| Context | Path | Responsibility |
|---|---|---|
| `cms` | `internal/app/cms` | Public website: landing page, registration, login, user profile. |
| `game` | `internal/app/game` | Game server: TCP + WebSocket transports, Habbo R26 binary protocol, session lifecycle, virtual state. |
| `housekeeping` | `internal/app/housekeeping` | Admin/moderation panel (TBD). |
| `installer` | `internal/app/installer` | First-run web UI: creates SQLite schema and writes initial `.env` config. |
| `reborn` | `internal/app/reborn` | Top-level orchestrator: loads `.env`, wires all contexts into a single HTTP server, starts TCP listener. |

Shared packages live under `internal/pkg/`:

- `dotenv` — environment variable loading.
- `httpx` — router, middleware helpers, live-reload (SSE).
- `storage` — SQLite-backed persistence layer.
- `tmpl` — Go HTML template rendering.
- `virtual` — in-memory virtual world state (Hotel, Habbo, Navigator, Room, FriendList, Achievement).

---

## Key Constraints

- **Database:** SQLite via `mattn/go-sqlite3` (CGO) and `modernc.org/sqlite` (pure Go). Single file, no server process.
- **Deployment:** Single binary entry point at `cmd/reborn/main.go`. All HTTP and TCP listeners start from one process.
- **Client delivery:** Godot HTML5 export is served statically by the same HTTP server under `web/client/`.
- **Protocol compatibility:** The game server must be wire-compatible with the original Habbo R26 Shockwave client and the new Godot HTML5 client.
- **Configuration:** Runtime config via `.env` file (managed by `dotenv` package); installer writes the initial file.

---

## Current Status

Early development. Core protocol handlers, session lifecycle, virtual state model, and CMS routes are partially implemented. The installer web UI skeleton exists. The Godot client is a WIP reimplementation of the original scenes.

See individual spec files for per-context detail:

- `spec-game-server.md`
- `spec-cms.md`
- `spec-installer.md`
- `spec-client.md`
