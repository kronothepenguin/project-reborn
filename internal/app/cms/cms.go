package cms

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

type CMS struct {
	resolve tmpl.Resolver

	data map[string]any
}

func New(resolver tmpl.Resolver) *CMS {
	return &CMS{
		resolve: resolver,
		data:    map[string]any{},
	}
}

func (c *CMS) Set(key string, value any) {
	c.data[key] = value
}

func (c *CMS) Mount(mux *http.ServeMux) {
	with := tmpl.WithTemplates(c.resolve)

	mux.Handle("GET /{$}", with(http.HandlerFunc(c.handleIndexView)))
	mux.Handle("POST /login", http.MaxBytesHandler(http.HandlerFunc(c.handleLogin), 1024))

	mux.Handle("GET /register", with(http.HandlerFunc(c.handleRegisterView)))
	mux.Handle("POST /register", http.MaxBytesHandler(http.HandlerFunc(c.handleRegister), 1024))

	mux.Handle("GET /me", with(http.HandlerFunc(c.handleMeView)))
}
