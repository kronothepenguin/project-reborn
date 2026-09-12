package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", nil)
}

// HandleIndexLogin handles the POST /{$} login action.
func (r *Router) HandleIndexLogin(w http.ResponseWriter, req *http.Request) {
	_ = req.ParseForm()

	astro.WriteTemplate(w, r.deps.Resolver, "index.html", nil)
}
