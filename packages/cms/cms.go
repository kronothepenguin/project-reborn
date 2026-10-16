package cms

import (
	"embed"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/router"
)

//go:embed dist/*
var DistFS embed.FS

type CMS struct {
	static  http.Handler
	resolve astro.Resolver
}

type Option func(*CMS)

func New(opts ...Option) *CMS {
	c := &CMS{}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

func (c *CMS) Mount(mux *http.ServeMux) {
	r := router.New(c.resolve)

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.HandleFunc("POST /{$}", r.HandleIndexLogin)

	mux.Handle("/", c.static)
}

func WithStatic(h http.Handler) Option {
	return func(c *CMS) {
		c.static = h
	}
}

func WithResolver(r astro.Resolver) Option {
	return func(c *CMS) {
		c.resolve = r
	}
}
