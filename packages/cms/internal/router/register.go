package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

func (router *Router) HandleRegisterView(w http.ResponseWriter, r *http.Request) {
	astro.WriteTemplate(w, router.Resolve, "register.html", nil)
}

func (router *Router) HandleRegister(w http.ResponseWriter, r *http.Request) {}
