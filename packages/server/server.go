package server

import (
	"database/sql"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type Server struct {
	db *sql.DB
}

func New(db *sql.DB) *Server {
	return &Server{db: db}
}

func (c *Server) Mount(mux *http.ServeMux) {
	r := router.New(router.Deps{DB: c.db, Queries: store.New(c.db)})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
}
