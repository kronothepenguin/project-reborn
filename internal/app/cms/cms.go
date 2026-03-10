package cms

import (
	"database/sql"

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

func (c *CMS) Mount(mux *httpx.ServeMux) {
	withTemplates := tmpl.WithTemplates(c.resolve)
	withGuard := guard(c.db)
	withAuthRedirect := authRedirect(c.db)

	mux.HandleFuncWith("GET /{$}", c.handleIndexView, withTemplates, withAuthRedirect)
	mux.HandleFuncWith("POST /{$}", c.handleLogin, withTemplates, httpx.MaxBytes(256))

	mux.HandleFuncWith("GET /register", c.handleRegisterView, withTemplates, withAuthRedirect)
	mux.HandleFuncWith("POST /register", c.handleRegister, withTemplates, httpx.MaxBytes(512))

	mux.HandleFuncWith("GET /me", c.handleMeView, withTemplates, withGuard)
}
