package router

import (
	"database/sql"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Deps are the shared services every handler can use.
type Deps struct {
	DB      *sql.DB
	Queries *store.Queries
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}
