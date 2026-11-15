# Mux patterns

## Contents

- Rules
- Package layout
- Deps and Router
- Handler files
- Route registration
- Route to file mapping
- Naming
- Verification

## Rules

1. The package root's `Mount(mux)` registers every route. Handler files define methods on `*Router` and leave the mux
   to `Mount`.
2. A handler file is named after its route, with the dynamic segments dropped: `GET /orders/{id}` → `orders.go`.
   Handler names follow [Naming](#naming).
3. Handlers are methods on `*Router`. Shared services are fields of `router.Deps`, reached as `r.deps.<Field>`, in
   place of package-level variables.
4. One `Router` serves every request. Keep request state in the handler's local variables.

## Package layout

`internal/router/` holds `router.go` plus one file per route group. The package root only wires things together.

```text
<module>/
├── app.go                      # public API: App, New, Mount, options
└── internal/router/
    ├── router.go               # Deps, Router, New
    ├── index.go                # GET /{$}, POST /{$}
    ├── me.go                   # GET /me, POST /me
    ├── orders.go               # GET /orders, GET /orders/{id}
    └── users-orders.go         # GET /users/{id}/orders
```

## Deps and Router

Shared services are named fields of `Deps`. Add a field when a handler needs one. Keep field types narrow: an interface
declared by the router.

```go
package router

// Renderer writes the named page with its data.
type Renderer interface {
	Render(w http.ResponseWriter, name string, data any)
}

// Deps are the shared services every handler can use.
type Deps struct {
	Pages Renderer
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}
```

## Handler files

Each file holds the data structs and the handlers of its routes.

`index.go`:

```go
type page struct {
	Title string
}

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.Render(w, "index.html", page{Title: "Welcome"})
}

// HandleIndexLogin handles the POST /{$} login action.
func (r *Router) HandleIndexLogin(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.Render(w, "index.html", page{Title: "Welcome"})
}
```

`me.go`:

```go
type mePage struct {
	Username string
}

// HandleMeView renders GET /me.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.Render(w, "me.html", mePage{Username: "admin"})
}

// HandleMeMotto handles the POST /me motto update.
func (r *Router) HandleMeMotto(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req, "/me", http.StatusSeeOther)
}
```

`orders.go` covers the collection and one member:

```go
// HandleOrdersView renders GET /orders.
func (r *Router) HandleOrdersView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.Render(w, "orders.html", page{Title: "Orders"})
}

// HandleOrderView renders GET /orders/{id}.
func (r *Router) HandleOrderView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.Render(w, "orders/id.html", page{Title: req.PathValue("id")})
}
```

`users-orders.go` joins two resource names with a hyphen:

```go
// HandleUsersOrdersView renders GET /users/{id}/orders.
func (r *Router) HandleUsersOrdersView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.Render(w, "users/id/orders.html", page{Title: req.PathValue("id")})
}
```

## Route registration

The package root registers the routes, in `app.go`:

```go
func (a *App) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{Pages: a.pages})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.HandleFunc("POST /{$}", r.HandleIndexLogin)
	mux.HandleFunc("GET /me", r.HandleMeView)
	mux.HandleFunc("POST /me", r.HandleMeMotto)
	mux.HandleFunc("GET /orders", r.HandleOrdersView)
	mux.HandleFunc("GET /orders/{id}", r.HandleOrderView)
	mux.HandleFunc("GET /users/{id}/orders", r.HandleUsersOrdersView)

	mux.Handle("/", a.static)
}
```

- Every pattern names its method: `GET /me`.
- The static handler comes last, on `/`. More specific patterns win.
- `{$}` matches the root path only. Keep it on the root page, since `/` matches every path and belongs to the static
  handler.

## Route to file mapping

| Route | File | Handler |
| --- | --- | --- |
| `GET /{$}` | `index.go` | `HandleIndexView` |
| `POST /{$}` | `index.go` | `HandleIndexLogin` |
| `GET /me` | `me.go` | `HandleMeView` |
| `POST /me` | `me.go` | `HandleMeMotto` |
| `GET /orders` | `orders.go` | `HandleOrdersView` |
| `GET /orders/{id}` | `orders.go` | `HandleOrderView` |
| `GET /users/{id}/orders` | `users-orders.go` | `HandleUsersOrdersView` |

To name the file, lower-case the static segments, join them with `-`, drop the dynamic `{...}` segments and append
`.go`. The root `/` is `index`.

## Naming

- `Handle<Resource>View` renders the page of a GET: one per page. `View` names GET handlers only.
- `Handle<Resource><Action>` names every other handler (`HandleIndexLogin`, `HandleMeMotto`). It handles an action and
  may re-render the page after a failure.
- An action name says the action, in place of the HTTP verb: `HandleMeMotto` over `HandleMePost`.
- A file has one `page` struct when its handlers share the shape. Otherwise name the struct for the route (`mePage`).
- Routes that share a file (`GET /orders` and `GET /orders/{id}`) get distinct handler names.

## Verification

Build and vet the module, then run the program and request each changed route, with one dynamic value and each action:

```sh
curl -i http://localhost:<port>/me
curl -i http://localhost:<port>/orders/42
curl -i -X POST http://localhost:<port>/me -d 'motto=hi'
```
