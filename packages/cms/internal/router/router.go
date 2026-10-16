package router

import (
	"github.com/kronothepenguin/project-reborn/packages/astro"
)

type Router struct {
	Resolve astro.Resolver
}

func New(resolver astro.Resolver) *Router {
	return &Router{Resolve: resolver}
}
