package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandleDisclaimerView renders GET /disclaimer.
func (r *Router) HandleDisclaimerView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "disclaimer.html", r.hotelStatus(req.Context()))
}
