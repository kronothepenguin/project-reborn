package installer

import (
	"database/sql"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

type Installer struct {
	db      *sql.DB
	resolve tmpl.Resolver

	done chan struct{}

	username string
	password string

	session string

	err error
}

func New(db *sql.DB, resolver tmpl.Resolver) *Installer {
	return &Installer{
		db:      db,
		resolve: resolver,

		done: make(chan struct{}),

		username: generateRandomString(8),
		password: generateRandomString(8),
	}
}

func (i *Installer) Mount(mux *http.ServeMux) {
	with := tmpl.WithTemplates(i.resolve)

	mux.Handle("GET /", with(http.HandlerFunc(i.handleIndexView)))
	mux.HandleFunc("POST /login", i.handleLogin)
	mux.Handle("GET /install", with(http.HandlerFunc(i.handleInstallView)))
	mux.HandleFunc("POST /install/database", i.handleInstallDatabase)
	mux.HandleFunc("POST /install/settings", i.handleInstallSettings)
	mux.HandleFunc("POST /install/administrator", i.handleInstallAdministrator)

}

func (i *Installer) Done() <-chan struct{} {
	return i.done
}

func Check(db *sql.DB) bool {
	return true
}
