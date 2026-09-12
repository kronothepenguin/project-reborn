package cms

import (
	"embed"
	"html/template"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/router"
)

//go:embed dist/*
var DistFS embed.FS

type CMS struct {
	static  http.Handler
	resolve func(string) (*template.Template, error)
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
	r := router.New(router.Deps{Resolver: c.resolve})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.HandleFunc("POST /{$}", r.HandleIndexLogin)

	mux.Handle("/", c.static)
}

func WithStatic(h http.Handler) Option {
	return func(c *CMS) {
		c.static = h
	}
}

func WithResolver(r func(string) (*template.Template, error)) Option {
	return func(c *CMS) {
		c.resolve = r
	}
}
