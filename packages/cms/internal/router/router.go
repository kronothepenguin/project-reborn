package router

import (
	"github.com/kronothepenguin/project-reborn/packages/astro"
)

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
