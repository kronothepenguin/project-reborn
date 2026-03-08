package cms

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

type CMS struct {
	resolve tmpl.Resolver
}

func New(resolver tmpl.Resolver) *CMS {
	return &CMS{resolve: resolver}
}

func (c *CMS) Mount(mux *http.ServeMux) {
	with := tmpl.WithTemplates(c.resolve)

	mux.Handle("GET /{$}", with(http.HandlerFunc(c.handleIndexView)))
	mux.HandleFunc("POST /login", c.handleLogin)

	mux.Handle("GET /register", with(http.HandlerFunc(c.handleRegisterView)))

	mux.Handle("GET /me", with(http.HandlerFunc(c.handleMeView)))
}
