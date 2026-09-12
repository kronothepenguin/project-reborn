# Mux patterns

## Contents

- Rules
- Package layout
- Deps and Router
- Handler files
- Route registration
- Route to file mapping
- Naming rules
- Verification

## Rules

1. Registration is centralized in the package root's `<pkg>.go` `Mount(mux)`; handler files only define methods on `*Router`.
2. Handler files are named after the registration route with dynamic segments dropped (`GET /rooms/{id}` → `rooms.go`).
3. `Handle<Resource>View` renders the page for a GET. `Handle<Resource><Action>` handles a mutating action and may re-render after a failure. Never use `View` on a non-GET handler.
4. Handlers are methods on `*Router`. Shared services live in `router.Deps` and are reached through `r.deps`. No package-level globals.

## Package layout

`internal/router/` contains one `router.go` plus one file per route group. The package root only wires things together.

```text
<module>/
├── <pkg>.go                    # public API: struct, New, Mount, options
└── internal/router/
    ├── router.go               # Deps + Router constructor
    ├── index.go                # GET /{$}, POST /{$}
    ├── me.go                   # GET /me, POST /me
    ├── rooms.go                # GET /rooms, GET /rooms/{id}
    └── users-rooms.go          # GET /users/{id}/rooms
```

## Deps and Router

Shared services are named fields on `Deps`. Add a field when a handler needs it; keep field types narrow (interfaces at the consumer).

```go
package router

import "github.com/kronothepenguin/project-reborn/packages/astro"

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}
```

Handlers access services as `r.deps.Resolver`. Never store request state on `Router`; `Router` is shared across all requests.

## Handler files

Each file defines the data structs and methods for its routes.

`index.go`:

```go
package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

type page struct {
	Title string
}

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", page{Title: "Welcome"})
}

// HandleIndexLogin handles the POST /{$} login action.
func (r *Router) HandleIndexLogin(w http.ResponseWriter, req *http.Request) {
	_ = req.ParseForm()
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", page{Title: "Welcome"})
}
```

`me.go`:

```go
package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

type mePage struct {
	Username string
}

// HandleMeView renders GET /me.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "me.html", mePage{Username: "admin"})
}

// HandleMeMotto handles the POST /me motto update.
func (r *Router) HandleMeMotto(w http.ResponseWriter, req *http.Request) {
	_ = req.ParseForm()
	http.Redirect(w, req, "/me", http.StatusSeeOther)
}
```

`rooms.go` covers both the collection and one member:

```go
package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandleRoomsView renders GET /rooms.
func (r *Router) HandleRoomsView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "rooms.html", page{Title: "Rooms"})
}

// HandleRoomView renders GET /rooms/{id}.
func (r *Router) HandleRoomView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "rooms/id.html", page{
		Title: req.PathValue("id"),
	})
}
```

`users-rooms.go` combines two resource names with a hyphen:

```go
package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandleUsersRoomsView renders GET /users/{id}/rooms.
func (r *Router) HandleUsersRoomsView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "users/id/rooms.html", page{
		Title: req.PathValue("id"),
	})
}
```

## Route registration

Registration stays in the package root (for example `web.go`), not in the router package:

```go
func (web *Web) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{Resolver: web.resolve})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.HandleFunc("POST /{$}", r.HandleIndexLogin)
	mux.HandleFunc("GET /me", r.HandleMeView)
	mux.HandleFunc("POST /me", r.HandleMeMotto)
	mux.HandleFunc("GET /rooms", r.HandleRoomsView)
	mux.HandleFunc("GET /rooms/{id}", r.HandleRoomView)
	mux.HandleFunc("GET /users/{id}/rooms", r.HandleUsersRoomsView)

	mux.Handle("/", web.static)
}
```

Rules:

- Method patterns (`GET /me`) require Go 1.22+ `http.ServeMux`; always include the method.
- Register every route in `Mount`. Handler files never touch the mux.
- The static handler is registered last with `/`; more specific patterns win automatically.

## Route to file mapping

| Route | File | Handler |
| --- | --- | --- |
| `GET /{$}` | `index.go` | `HandleIndexView` |
| `POST /{$}` | `index.go` | `HandleIndexLogin` |
| `GET /me` | `me.go` | `HandleMeView` |
| `POST /me` | `me.go` | `HandleMeMotto` |
| `GET /rooms` | `rooms.go` | `HandleRoomsView` |
| `GET /rooms/{id}` | `rooms.go` | `HandleRoomView` |
| `GET /users/{id}/rooms` | `users-rooms.go` | `HandleUsersRoomsView` |

Derivation: lower-case the static path segments, join them with `-`, drop dynamic `{...}` segments, and append `.go`. Root `/` becomes `index`.

## Naming rules

- `Handle<Resource>View` — the handler whose job is rendering the GET page. Exactly one per page.
- `Handle<Resource><Action>` — any other handler (`HandleIndexLogin`, `HandleMeMotto`). It may re-render on validation failure, but the `View` suffix stays out of action names.
- Action names use the action, not the HTTP verb: `HandleMeMotto`, not `HandleMePost`.
- One `page` struct per file when the shape is shared across its handlers; otherwise name it for the route (`mePage`).
- Several routes intentionally share one file (`GET /rooms` and `GET /rooms/{id}` are both `rooms.go`). Give the handlers distinct names.
- `{$}` matches the root path only. Never replace it with `/`, which matches everything and is owned by the static handler.

## Verification

```sh
cd <module-directory> && go build ./... && go vet ./...
```

Then run the app and hit each changed route, including one dynamic value:

```sh
curl -i http://localhost:8080/me
curl -i http://localhost:8080/rooms/42
curl -i -X POST http://localhost:8080/me -d 'motto=hi'
```
