package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

type indexPage struct {
	chrome
}

// HandleIndexView renders GET /housekeeping/{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", indexPage{chrome: r.chrome(req)})
}
