# CMS Specification

**Status:** WIP
**Package:** `internal/app/cms`

---

## Purpose

The CMS is the public-facing website for Project Reborn. It provides the landing/login page, user registration, and an authenticated profile page. It is a standard server-rendered Go web application; there is no JavaScript framework or API layer.

---

## Routes

| Method | Path | Handler | Description |
|---|---|---|---|
| `GET` | `/` | `handleIndexView` | Landing page. Redirects authenticated users. |
| `POST` | `/` | `handleLogin` | Processes login form submission. Max body 256 bytes. |
| `GET` | `/register` | `handleRegisterView` | Registration form. Redirects authenticated users. |
| `POST` | `/register` | `handleRegister` | Processes registration form. Max body 512 bytes. |
| `GET` | `/me` | `handleMeView` | Authenticated user profile page. Requires session. |

Routes are mounted via `httpx.ServeMux` which wraps the standard library mux with middleware support.

---

## Middleware

| Middleware | Applied To | Behaviour |
|---|---|---|
| `tmpl.WithTemplates` | All view routes | Injects the template resolver into the request context. |
| `guard` | `/me` | Rejects unauthenticated requests (no valid session cookie). |
| `authRedirect` | `GET /`, `GET /register` | Redirects already-authenticated users away from public pages. |
| `httpx.MaxBytes` | POST routes | Limits request body size to prevent oversized form submissions. |

---

## Authentication

- Session-based. Session state is stored server-side; the client holds a session cookie.
- The `guard` middleware reads the session cookie and validates it against the database.
- The `authRedirect` middleware does the inverse: redirects logged-in users away from public routes.
- Logout route: TBD (`/logout` via auth.go, exact route not yet mounted).

---

## Input Validation

Validators live under `internal/app/cms/validator/`:

| Validator | File | Validates |
|---|---|---|
| Avatar name | `avatarname.go` | Habbo name format rules |
| Date | `date.go` | Date of birth or similar date fields |
| Email | `email.go` | Email address format |
| Password | `password.go` | Password strength / length |
| String | `string.go` | Generic string constraints (length, characters) |

All validation is applied before any database write.

---

## Templates

- Go `html/template` is used for all page rendering.
- The `tmpl` package (`internal/pkg/tmpl`) provides the `Resolver` interface and `ExecuteTemplate` helper.
- Template files are located under `web/` (exact subdirectory TBD).
- The `tmpl.WithTemplates` middleware injects the resolver into the request context so handlers can render without a direct dependency on the resolver.

---

## Development Mode

- `air` (hot-reload for Go) is used to restart the server process on `.go` file changes.
- `httpx/live.go` implements live reload via SSE: the browser subscribes to a server-sent event stream; when the server detects a template file change (via `fsnotify`), it sends a reload event to all connected browsers.
- Dev tooling config lives under `tools/dev/cms/`.

---

## Dependencies on Shared Packages

| Package | Usage |
|---|---|
| `internal/pkg/httpx` | Router (`ServeMux`), middleware helpers, `MaxBytes`, live reload (SSE) |
| `internal/pkg/storage` | User persistence (read/write users via SQLite) |
| `internal/pkg/tmpl` | Template resolver, `ExecuteTemplate`, `WithTemplates` middleware |
| `internal/pkg/dotenv` | Runtime configuration via `.env` |
