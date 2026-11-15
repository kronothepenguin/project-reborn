# Mux patterns

## Contents

- Rules
- Package layout
- Package root
- Deps and Router
- Handler files
- Route to file mapping
- Naming
- Verification

## Rules

1. The package root's `Mount(mux)` registers every route. Handler files define methods on `*Router` and leave the mux
   to `Mount`.
2. One handler file per route path, named as [Route to file mapping](#route-to-file-mapping) says. The methods of one
   path share its file. Shared helpers of the router live in `router.go` or in the file of the resource they serve;
   every other file is named for a route path. Handler names follow [Naming](#naming).
3. Handlers are methods on `*Router`. `router.Deps` holds what the handlers share, reached as `r.deps.<Field>`.
4. Shared helper packages, such as settings and sign-in, are package-level functions. Handlers call them directly.
5. One `Router` serves every request. Keep request state in the handler's local variables.

## Package layout

`internal/router/` holds `router.go` plus one file per route path. The package root only wires things together.

```text
<module>/
├── app.go                      # public API: App, New, Inject, Mount, options
└── internal/router/
    ├── router.go               # Deps, Router, New, shared helpers
    ├── index.go                # GET /{$}, POST /{$}
    ├── me.go                   # GET /me, POST /me
    ├── register.go             # GET /register, POST /register
    ├── orders.go               # GET /orders, GET /orders/{id}
    ├── users_orders.go         # GET /users/{id}/orders
    ├── groups_join.go          # POST /groups/{id}/join
    └── xml_orders.go           # GET /xml/orders.xml
```

## Package root

`New` takes what the package requires as arguments. Options set what differs between runners, such as the page
templates and the static files of production and development. `Inject` hands over a service another program
implements, after `New` and before `Mount`.

```go
type App struct {
	db       *sql.DB
	pages    *template.Template
	static   http.Handler
	services Services
}

// Services are implemented by another program.
type Services struct {
	Mailer mail.Sender
}

type Option func(*App)

func WithPages(pages *template.Template, static http.Handler) Option {
	return func(a *App) { a.pages, a.static = pages, static }
}

func New(db *sql.DB, opts ...Option) *App {
	a := &App{db: db}
	for _, opt := range opts {
		opt(a)
	}
	return a
}

func (a *App) Inject(s Services) {
	a.services = s
}

func (a *App) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{
		DB:      a.db,
		Queries: data.New(a.db),
		Pages:   a.pages,
		Mailer:  a.services.Mailer,
	})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.HandleFunc("POST /{$}", r.HandleIndexLogin)
	mux.HandleFunc("GET /me", r.HandleMeView)
	mux.HandleFunc("POST /me", r.HandleMeSave)
	mux.HandleFunc("GET /register", r.HandleRegisterView)
	mux.HandleFunc("POST /register", r.HandleRegister)
	mux.HandleFunc("GET /orders", r.HandleOrdersView)
	mux.HandleFunc("GET /orders/{id}", r.HandleOrderView)
	mux.HandleFunc("GET /users/{id}/orders", r.HandleUsersOrdersView)
	mux.HandleFunc("POST /groups/{id}/join", r.HandleGroupsJoin)
	mux.HandleFunc("GET /xml/orders.xml", r.HandleOrdersXML)
	mux.HandleFunc("GET /health", r.HandleHealthText)

	mux.Handle("/", a.static)
}
```

- Every pattern names its method: `GET /me`.
- The static handler comes last, on `/`. More specific patterns win.
- `{$}` matches the root path only. Keep it on the root page, since `/` matches every path and belongs to the static
  handler.

## Deps and Router

`Deps` holds what the handlers share, as concrete types: what `New` received (the database, the page templates), what
the package built from it (the bound queries) and the injected services. Add a field when a handler needs one.

```go
package router

// Deps are what the handlers share: what New and Inject received and what the package built from it.
type Deps struct {
	DB      *sql.DB
	Queries *data.Queries
	Pages   *template.Template
	Mailer  mail.Sender
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}
```

## Handler files

Each file holds the data structs and the handlers of its route path.

`me.go`:

```go
type mePage struct {
	Username string
	SiteName string
}

// HandleMeView renders GET /me.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	page := mePage{Username: "admin", SiteName: settings.String("site.name")}
	r.deps.Pages.ExecuteTemplate(w, "me.html", page)
}

// HandleMeSave handles POST /me, the motto form.
func (r *Router) HandleMeSave(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req, "/me", http.StatusSeeOther)
}
```

`orders.go` holds the collection and one member, since both paths name the same file:

```go
// HandleOrdersView renders GET /orders.
func (r *Router) HandleOrdersView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.ExecuteTemplate(w, "orders.html", nil)
}

// HandleOrderView renders GET /orders/{id}.
func (r *Router) HandleOrderView(w http.ResponseWriter, req *http.Request) {
	r.deps.Pages.ExecuteTemplate(w, "orders/id.html", req.PathValue("id"))
}
```

`groups_join.go`:

```go
// HandleGroupsJoin handles POST /groups/{id}/join.
func (r *Router) HandleGroupsJoin(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req, "/groups/"+req.PathValue("id"), http.StatusSeeOther)
}
```

## Route to file mapping

To name the file, take the route path:

1. Leave out a prefix that every route of the package shares: a package mounted under `/admin` names `/admin/news`
   as `news.go`.
2. Lower-case the static segments and join them with `_`.
3. Turn a `-` or `.` inside a segment into `_`.
4. Drop the dynamic `{...}` segments and a file extension.
5. Append `.go`. The root is `index.go`.

| Route | File | Handler |
| --- | --- | --- |
| `GET /{$}` | `index.go` | `HandleIndexView` |
| `POST /{$}` | `index.go` | `HandleIndexLogin` |
| `GET /me` | `me.go` | `HandleMeView` |
| `POST /me` | `me.go` | `HandleMeSave` |
| `POST /me/tags` | `me_tags.go` | `HandleMeTagsAdd` |
| `GET /register` | `register.go` | `HandleRegisterView` |
| `POST /register` | `register.go` | `HandleRegister` |
| `POST /logout` | `logout.go` | `HandleLogout` |
| `GET /orders` | `orders.go` | `HandleOrdersView` |
| `GET /orders/{id}` | `orders.go` | `HandleOrderView` |
| `GET /users/{id}/orders` | `users_orders.go` | `HandleUsersOrdersView` |
| `GET /account/looks` | `account_looks.go` | `HandleAccountLooksView` |
| `POST /account/looks` | `account_looks.go` | `HandleAccountLooksSave` |
| `POST /groups/{id}/join` | `groups_join.go` | `HandleGroupsJoin` |
| `POST /home-store/items/{id}/purchase` | `home_store_items_purchase.go` | `HandleHomeStoreItemsPurchase` |
| `GET /xml/orders.xml` | `xml_orders.go` | `HandleOrdersXML` |
| `GET /orders.json` | `orders.go` | `HandleOrdersJSON` |
| `GET /avatars/{id}/image` | `avatars_image.go` | `HandleAvatarImage` |
| `GET /health` | `health.go` | `HandleHealthText` |
| `GET /account` | `account.go` | `HandleAccountRedirect` |
| `GET /tools/test` | `tools_test_route.go` | `HandleToolsTestView` |

## Naming

- A GET that renders a page ends in `View`: `HandleOrdersView`. One per page.
- A GET that returns data ends in its format: `Handle<Resource>JSON`, `Handle<Resource>XML`, `Handle<Resource>Image`,
  `Handle<Resource>Text` (`HandleOrdersJSON`, `HandleOrdersXML`, `HandleAvatarImage`, `HandleHealthText`).
- A GET that only redirects is `Handle<Resource>Redirect`: `HandleAccountRedirect`.
- Every handler that is no GET is `Handle<Resource><Action>`. It handles an action and may re-render the page after a
  failure.
- A form that saves a page's values ends in `Save`: `HandleMeSave`, `HandleAccountLooksSave`. Other actions say what
  they do: `HandleIndexLogin`, `HandleMeTagsAdd`, `HandleHomeStoreItemsPurchase`.
- When the last static segment of the path is the action, that segment names it: `POST /register` is `HandleRegister`,
  `POST /logout` is `HandleLogout`, `POST /groups/{id}/join` is `HandleGroupsJoin`.
- An action name says the action, in place of the HTTP verb: `HandleMeSave` over `HandleMePost`.
- A file has one `page` struct when its handlers share the shape. Otherwise name the struct for the route (`mePage`).
- Routes that share a file (`GET /orders` and `GET /orders/{id}`) get distinct handler names.

## Verification

Build and vet the module, then run the program and request each changed route, with one dynamic value and each action:

```sh
curl -i http://localhost:<port>/me
curl -i http://localhost:<port>/orders/42
curl -i -X POST http://localhost:<port>/me -d 'motto=hi'
```
