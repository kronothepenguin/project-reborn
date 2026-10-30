package router

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	DB       *sql.DB
	Queries  *store.Queries
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// hotelStatus holds what the signed-out layout reads. The hotel stays offline
// until the game server exists.
type hotelStatus struct {
	Online      bool
	OnlineCount int
}

func (r *Router) invalid(w http.ResponseWriter, name string, data any) {
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, name, data)
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	slog.Error("cms", "err", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}
