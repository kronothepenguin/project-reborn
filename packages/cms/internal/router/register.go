package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandleRegisterView renders GET /register.
func (r *Router) HandleRegisterView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "register.html", nil)
}

// HandleRegister handles the POST /register action.
func (r *Router) HandleRegister(w http.ResponseWriter, req *http.Request) {}
