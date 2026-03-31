# Installer Specification

**Status:** WIP
**Package:** `internal/app/installer`

---

## Purpose

The installer is a first-run web UI that bootstraps a new Project Reborn deployment. It creates the SQLite database and schema, and writes an initial `.env` configuration file. It must be completed before any other application context (`cms`, `game`) can function.

---

## When It Runs

The `reborn` orchestrator checks database state on startup via `installer.Check(db)`. If the check fails (database absent or schema not initialised), `reborn` should redirect all HTTP traffic to the installer until setup is complete.

The installer signals completion via a `Done()` channel (`chan struct{}`). When closed, the orchestrator can proceed to start the CMS and game server.

---

## Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Landing/login page. Shows login error if credentials were wrong. |
| `POST` | `/login` | Validates installer credentials (randomly generated on startup). Sets session cookie on success. |
| `GET` | `/install` | Main installation wizard page. Requires valid session cookie. |
| `POST` | `/install/database` | Creates SQLite database and runs schema migrations. Requires session. |
| `POST` | `/install/settings` | Writes application settings to `.env`. Requires session. |
| `POST` | `/install/administrator` | Creates the initial administrator account. Requires session. |

---

## Security Model

The installer generates random `username` and `password` strings (8 characters each) at startup. These are printed to stdout (or logged) so the operator can log in. This prevents unauthenticated access to the setup wizard.

Session state is a randomly generated 32-character string stored in memory and compared against a cookie on each protected request.

---

## Installation Steps (Wizard Flow)

1. Operator navigates to installer URL.
2. Login with generated credentials.
3. `/install` page presents the multi-step form:
   - **Database** — confirm SQLite file path; trigger schema creation (`handleInstallDatabase`).
   - **Settings** — set host, port, and other runtime config; write `.env` (`handleInstallSettings`).
   - **Administrator** — create the first admin user (`handleInstallAdministrator`).
4. On completion, installer closes its `Done()` channel; `reborn` starts normal operation.

---

## Future: Migration Runner

TODO: The installer should evolve into a migration runner for schema changes between versions. A versioned migration table in SQLite will track applied migrations.

---

## Templates

Uses `internal/pkg/tmpl` for rendering. Two page templates:

- `index.page.html` — login page (shows `LoginError` if set).
- `install.page.html` — wizard page.

---

## Dependencies

| Package | Usage |
|---|---|
| `internal/pkg/tmpl` | Template rendering |
| `database/sql` + SQLite driver | Schema creation and data writes |
