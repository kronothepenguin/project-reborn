package router

import (
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

func (router *Router) HandleIndexView(w http.ResponseWriter, r *http.Request) {
	astro.WriteTemplate(w, router.Resolve, "index.html", nil)
}

func (router *Router) HandleIndexLogin(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		astro.WriteTemplate(w, router.Resolve, "index.html", nil)
		return
	}

	username := strings.TrimSpace(r.PostFormValue("username"))
	password := r.PostFormValue("password")
	// remember := r.PostFormValue("remember") != ""

	if username == "" || password == "" {
		astro.WriteTemplate(w, router.Resolve, "index.html", map[string]any{
			"Error": "Invalid username or password",
		})
		return
	}
}
