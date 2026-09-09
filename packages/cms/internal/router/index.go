package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

func (router *Router) HandleIndexView(w http.ResponseWriter, r *http.Request) {
	astro.WriteTemplate(w, router.resolve, "index.html", nil)
}

func (router *Router) HandleIndexLogin(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	astro.WriteTemplate(w, router.resolve, "index.html", nil)
}
