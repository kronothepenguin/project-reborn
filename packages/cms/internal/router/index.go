package router

import (
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", nil)
}

// HandleIndexLogin handles the POST /{$} login action.
func (r *Router) HandleIndexLogin(w http.ResponseWriter, req *http.Request) {
	if err := req.ParseForm(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		astro.WriteTemplate(w, r.deps.Resolver, "index.html", nil)
		return
	}

	username := strings.TrimSpace(req.PostFormValue("username"))
	password := req.PostFormValue("password")
	// remember := req.PostFormValue("remember") != ""

	if username == "" || password == "" {
		astro.WriteTemplate(w, r.deps.Resolver, "index.html", map[string]any{
			"Error": "Invalid username or password",
		})
		return
	}
}
