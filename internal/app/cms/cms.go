package cms

import (
	"database/sql"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/httpx"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

type CMS struct {
	resolve tmpl.Resolver
	data    map[string]any

	db *sql.DB
}

func New(resolver tmpl.Resolver, db *sql.DB) *CMS {
	return &CMS{
		resolve: resolver,
		data:    map[string]any{},

		db: db,
	}
}

func (c *CMS) Set(key string, value any) {
	c.data[key] = value
}

func (c *CMS) Mount(mux *http.ServeMux) {
	withTemplates := tmpl.WithTemplates(c.resolve)
	withGuard := guard(c.db)
	withAuthRedirect := authRedirect(c.db)

	mux.Handle("GET /{$}", httpx.With(http.HandlerFunc(c.handleIndexView), withTemplates, withAuthRedirect))
	mux.Handle("POST /{$}", httpx.With(http.HandlerFunc(c.handleLogin), httpx.MaxBytes(256)))

	mux.Handle("GET /register", httpx.With(http.HandlerFunc(c.handleRegisterView), withTemplates, withAuthRedirect))
	mux.Handle("POST /register", httpx.With(http.HandlerFunc(c.handleRegister), httpx.MaxBytes(512)))

	mux.Handle("GET /me", httpx.With(http.HandlerFunc(c.handleMeView), withTemplates, withGuard))
}
